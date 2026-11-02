import express from 'express';
import { Event } from '../models/Event.js';
import { EventRegistration } from '../models/EventRegistration.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();


router.get('/recent', async (req, res) => {
  try {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const recentEvents = await Event.find({ eventDate: { $gte: today } })
      .sort({ eventDate: 1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      count: recentEvents.length,
      data: recentEvents,
    });
  } catch (error) {
    console.error('Error fetching recent events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent events.',
      error: error.message,
    });
  }
});


router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { search, category, location } = req.query;
    const filter = { eventDate: { $gte: today } };

    if (category && category !== 'All') {
      filter.eventType = category;
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(filter).sort({ eventDate: 1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve upcoming events.',
      error: error.message,
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'The requested event could not be found.',
      });
    }


    const participantCount = await EventRegistration.countDocuments({ eventId: event._id });

    return res.status(200).json({
      success: true,
      data: {
        ...event.toObject(),
        participantCount,
      },
    });
  } catch (error) {
    console.error('Error fetching single event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event details.',
      error: error.message,
    });
  }
});


router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, eventType, thumbnail, location, eventDate } = req.body;

    if (!title || !description || !eventType || !thumbnail || !location || !eventDate) {
      return res.status(400).json({
        success: false,
        message: 'All fields (title, description, eventType, thumbnail, location, eventDate) are required.',
      });
    }


    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event date format.',
      });
    }

    const now = new Date();
    if (parsedDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be set in the future. You cannot schedule events in the past.',
      });
    }

    const newEvent = await Event.create({
      title: title.trim(),
      description: description.trim(),
      eventType,
      thumbnail: thumbnail.trim(),
      location: location.trim(),
      eventDate: parsedDate,
      organizerEmail: req.user.email,
      organizerName: req.user.name,
    });

    return res.status(201).json({
      success: true,
      message: 'Community service event published successfully!',
      data: newEvent,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create event.',
    });
  }
});


router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }


    if (event.organizerEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are only allowed to edit events that you organized.',
      });
    }

    const { title, description, eventType, thumbnail, location, eventDate } = req.body;


    if (eventDate) {
      const parsedDate = new Date(eventDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event date format.',
        });
      }
      if (parsedDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Updated event date must be in the future.',
        });
      }
      event.eventDate = parsedDate;
    }

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (eventType) event.eventType = eventType;
    if (thumbnail) event.thumbnail = thumbnail.trim();
    if (location) event.location = location.trim();

    const updatedEvent = await event.save();

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: updatedEvent,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update event.',
    });
  }
});


router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (event.organizerEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are only allowed to delete events that you organized.',
      });
    }

  
    await Event.findByIdAndDelete(id);
    await EventRegistration.deleteMany({ eventId: id });

    return res.status(200).json({
      success: true,
      message: 'Event and associated volunteer registrations have been permanently deleted.',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete event.',
    });
  }
});


router.post('/:id/join', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'The event you are trying to join does not exist.',
      });
    }

    if (new Date(event.eventDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This event has already occurred. You can only join future events.',
      });
    }

    const alreadyJoined = await EventRegistration.findOne({
      eventId: event._id,
      userEmail: req.user.email,
    });

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered as a volunteer for this event!',
      });
    }

    const registration = await EventRegistration.create({
      eventId: event._id,
      userEmail: req.user.email,
      userName: req.user.name,
      joinedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: `Congratulations! You have successfully joined "${event.title}".`,
      data: registration,
    });
  } catch (error) {
    console.error('Error joining event:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event.',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to join event.',
    });
  }
});

export default router;

