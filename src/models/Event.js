import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      minlength: [20, 'Description must be at least 20 characters long'],
    },
    eventType: {
      type: String,
      required: [true, 'Event category/type is required'],
      enum: {
        values: [
          'Cleanup',
          'Plantation',
          'Donation',
          'Education',
          'Healthcare',
          'Winter Relief',
          'Food Drive',
          'Blood Donation'
        ],
        message: '{VALUE} is not a valid event type',
      },
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail image URL is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date and time is required'],
      validate: {
        validator: function (val) {
          
          return new Date(val) >= new Date();
        },
        message: 'Event date must be in the future. Past dates are strictly prohibited.',
      },
    },
    organizerEmail: {
      type: String,
      required: [true, 'Organizer email is required'],
      lowercase: true,
      trim: true,
    },
    organizerName: {
      type: String,
      default: 'Community Organizer',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


eventSchema.index({ eventDate: 1 });
eventSchema.index({ organizerEmail: 1 });

export const Event = mongoose.model('Event', eventSchema);
export default Event;

