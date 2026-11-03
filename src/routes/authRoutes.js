import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'assignment8-secret-key-super-secure-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  return hasMinLength && hasUppercase && hasLowercase;
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 6 characters and contain at least one uppercase letter and one lowercase letter.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      image: image || undefined,
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user account. Please try again.',
      error: error.message,
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful. Welcome back!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again later.',
      error: error.message,
    });
  }
});

// Google Auth
router.post('/google', async (req, res) => {
  try {
    const { email, name, image } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for Google authentication.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: name || 'Google Volunteer',
        email: normalizedEmail,
        image:
          image ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Google authentication failed.',
      error: error.message,
    });
  }
});

// GitHub Auth
router.post('/github', async (req, res) => {
  try {
    const { code, email, name, image } = req.body;

    let userEmail = email;
    let userName = name;
    let userImage = image;

    if (code) {
      const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23licEIOKFv6zd82N0';
      const clientSecret = process.env.GITHUB_CLIENT_SECRET || 'dfac3c39a01caecb2639efe2fbf18f67da3c334c';

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return res.status(400).json({
          success: false,
          message: tokenData.error_description || 'Failed to authenticate with GitHub.',
        });
      }

      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Assignment-8-SEP',
        },
      });
      const githubUser = await userRes.json();

      userName = githubUser.name || githubUser.login || 'GitHub Volunteer';
      userImage = githubUser.avatar_url;

      if (githubUser.email) {
        userEmail = githubUser.email;
      } else {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            'User-Agent': 'Assignment-8-SEP',
          },
        });
        const emails = await emailsRes.json();
        if (Array.isArray(emails)) {
          const primaryEmail = emails.find((e) => e.primary && e.verified) || emails[0];
          if (primaryEmail && primaryEmail.email) {
            userEmail = primaryEmail.email;
          }
        }
      }

      if (!userEmail) {
        userEmail = `${githubUser.login || 'volunteer'}@users.noreply.github.com`;
      }
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for GitHub authentication.',
      });
    }

    const normalizedEmail = userEmail.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: userName || 'GitHub Volunteer',
        email: normalizedEmail,
        image:
          userImage ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      });
    } else if (userImage && (!user.image || user.image.includes('unsplash.com'))) {
      user.image = userImage;
      await user.save();
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: 'GitHub authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.error('GitHub Auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'GitHub authentication failed.',
      error: error.message,
    });
  }
});

// Current User Profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user session.',
      error: error.message,
    });
  }
});

// Update Profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, image } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (image) user.image = image.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile.',
    });
  }
});

export default router;
