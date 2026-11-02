import express from 'express';
import { Event } from '../models/Event.js';
import { EventRegistration } from '../models/EventRegistration.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();


router.get('/events', requireAuth, async (req, res) => {
  try {
    const userEvents = await Event.find({
      organizerEmail: req.user.email.toLowerCase(),
    }).sort({ eventDate: 1 });


    const eventsWithCount = await Promise.all(
      userEvents.map(async (event) => {
        const count = await EventRegistration.countDocuments({ eventId: event._id });
        return {
          ...event.toObject(),
          participantCount: count,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: eventsWithCount.length,
      data: eventsWithCount,
    });
  } catch (error) {
    console.error('Error fetching user created events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your organized events.',
      error: error.message,
    });
  }
});


router.get('/joined-events', requireAuth, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({
      userEmail: req.user.email.toLowerCase(),
    }).populate('eventId');

   
    const validEvents = registrations
      .filter((reg) => reg.eventId !== null)
      .map((reg) => ({
        registrationId: reg._id,
        joinedAt: reg.joinedAt,
        ...reg.eventId.toObject(),
      }))
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

    return res.status(200).json({
      success: true,
      count: validEvents.length,
      data: validEvents,
    });
  } catch (error) {
    console.error('Error fetching joined events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your joined events.',
      error: error.message,
    });
  }
});


router.get('/joined-ids', requireAuth, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({
      userEmail: req.user.email.toLowerCase(),
    }).select('eventId');

    const joinedEventIds = registrations.map((r) => r.eventId.toString());

    return res.status(200).json({
      success: true,
      data: joinedEventIds,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching joined event status.',
    });
  }
});

export default router;

