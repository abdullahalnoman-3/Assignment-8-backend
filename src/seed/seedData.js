import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';
import { fileURLToPath } from 'url';
import path from 'path';

// Fix for Windows DNS SRV lookup issues with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // fallback to system dns
}

import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { EventRegistration } from '../models/EventRegistration.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/assignment8';

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // Clear existing collections
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      EventRegistration.deleteMany({}),
    ]);
    console.log('Previous records cleared.');

    // 1. Create Users
    console.log('Creating seed users...');
    const salt = await bcrypt.genSalt(10);
    const defaultHashedPassword = await bcrypt.hash('Password123', salt);

    const usersData = [
      {
        name: 'Tanvir Ahmed',
        email: 'tanvir.ahmed@example.com',
        password: defaultHashedPassword,
        image:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      },
      {
        name: 'Nusrat Jahan',
        email: 'nusrat.jahan@example.com',
        password: defaultHashedPassword,
        image:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      },
      {
        name: 'Arif Hossain',
        email: 'arif.hossain@example.com',
        password: defaultHashedPassword,
        image:
          'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
      },
      {
        name: 'Sabrina Yasmin',
        email: 'sabrina.yasmin@example.com',
        password: defaultHashedPassword,
        image:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      },
    ];

    const createdUsers = await User.insertMany(usersData);
    console.log(`Created ${createdUsers.length} users.`);

    // 2. Create Events (Both Upcoming and Past)
    console.log('Creating seed events...');

    const eventsData = [
      // UPCOMING EVENTS (Future Dates)
      {
        title: 'Dhaka City Tree Plantation Campaign',
        description:
          'Join us to plant over 1000 indigenous trees across Ramna and surrounding areas to restore urban green cover and combat air pollution.',
        eventType: 'Plantation',
        thumbnail:
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
        location: 'Ramna Park, Dhaka',
        eventDate: new Date('2026-11-20T09:00:00.000Z'),
        organizerEmail: 'tanvir.ahmed@example.com',
        organizerName: 'Tanvir Ahmed',
      },
      {
        title: 'Gulshan Lake Clean-up & Waste Segregation Drive',
        description:
          'A dedicated morning volunteer effort to remove floating plastics, clean shoreline trash, and educate nearby vendors about sustainable waste disposal.',
        eventType: 'Cleanup',
        thumbnail:
          'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
        location: 'Gulshan 2 Lake Park, Dhaka',
        eventDate: new Date('2026-11-28T08:30:00.000Z'),
        organizerEmail: 'nusrat.jahan@example.com',
        organizerName: 'Nusrat Jahan',
      },
      {
        title: 'Free Health Screening & Medical Camp',
        description:
          'Community health camp providing free blood pressure checkups, diabetes screening, basic medicine distribution, and doctor consultations for seniors.',
        eventType: 'Healthcare',
        thumbnail:
          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        location: 'Mirpur Community Center, Dhaka',
        eventDate: new Date('2026-12-05T10:00:00.000Z'),
        organizerEmail: 'arif.hossain@example.com',
        organizerName: 'Arif Hossain',
      },
      {
        title: 'Winter Relief & Warm Clothes Distribution',
        description:
          'Distributing warm blankets, sweaters, and winter clothing kits to homeless and low-income families in Northern Bangladesh facing cold waves.',
        eventType: 'Winter Relief',
        thumbnail:
          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
        location: 'Kurigram Sadar, Rangpur',
        eventDate: new Date('2026-12-18T11:00:00.000Z'),
        organizerEmail: 'sabrina.yasmin@example.com',
        organizerName: 'Sabrina Yasmin',
      },
      {
        title: 'Underprivileged Children Educational Book Drive',
        description:
          'Collecting storybooks, stationery, and educational materials to set up mini-libraries for community schools helping street children learn.',
        eventType: 'Education',
        thumbnail:
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
        location: 'Central Public Library, Shahbagh, Dhaka',
        eventDate: new Date('2027-01-08T14:00:00.000Z'),
        organizerEmail: 'tanvir.ahmed@example.com',
        organizerName: 'Tanvir Ahmed',
      },
      {
        title: 'Emergency Blood Donation & Awareness Camp',
        description:
          'Voluntary blood donation drive organized in partnership with local hospitals to maintain critical blood bank supplies for thalassemia patients.',
        eventType: 'Blood Donation',
        thumbnail:
          'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80',
        location: 'Dhaka Medical College Premises, Dhaka',
        eventDate: new Date('2027-01-20T09:30:00.000Z'),
        organizerEmail: 'nusrat.jahan@example.com',
        organizerName: 'Nusrat Jahan',
      },

      // PAST / BACK-DATED EVENTS (Historical)
      {
        title: 'Slum Food Drive & Nutrition Package Distribution',
        description:
          'Successfully provided nutritious dry food, drinking water, and hygiene kits to over 300 vulnerable families living in Korail Slum.',
        eventType: 'Food Drive',
        thumbnail:
          'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
        location: 'Korail Slum, Banani, Dhaka',
        eventDate: new Date('2026-09-15T10:00:00.000Z'),
        organizerEmail: 'arif.hossain@example.com',
        organizerName: 'Arif Hossain',
      },
      {
        title: "Cox's Bazar Beach Plastic Cleanup Marathon",
        description:
          'Over 150 volunteers gathered on Kolatoli beach and collected 1.2 tons of discarded non-biodegradable plastic and fishing nets.',
        eventType: 'Cleanup',
        thumbnail:
          'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
        location: 'Kolatoli Beach, Coxs Bazar',
        eventDate: new Date('2026-10-05T08:00:00.000Z'),
        organizerEmail: 'sabrina.yasmin@example.com',
        organizerName: 'Sabrina Yasmin',
      },
      {
        title: 'Emergency Flood Relief and Rehabilitation Support',
        description:
          'Emergency supply distribution including medicines, water purification tablets, and emergency food rations to flood-affected communities.',
        eventType: 'Donation',
        thumbnail:
          'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
        location: 'Feni Sadar, Feni',
        eventDate: new Date('2026-08-20T11:00:00.000Z'),
        organizerEmail: 'tanvir.ahmed@example.com',
        organizerName: 'Tanvir Ahmed',
      },
    ];


    const createdEvents = await Event.collection.insertMany(
      eventsData.map((e) => ({
        ...e,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    console.log(`Created ${createdEvents.insertedCount} events (both upcoming and past).`);

    // 3. Create Sample Registrations
    console.log('Creating sample event registrations...');
    const allEvents = await Event.find({});
    const sampleRegistrations = [
      {
        eventId: allEvents[0]._id,
        userEmail: 'nusrat.jahan@example.com',
        userName: 'Nusrat Jahan',
        joinedAt: new Date(),
      },
      {
        eventId: allEvents[0]._id,
        userEmail: 'arif.hossain@example.com',
        userName: 'Arif Hossain',
        joinedAt: new Date(),
      },
      {
        eventId: allEvents[1]._id,
        userEmail: 'tanvir.ahmed@example.com',
        userName: 'Tanvir Ahmed',
        joinedAt: new Date(),
      },
      {
        eventId: allEvents[2]._id,
        userEmail: 'sabrina.yasmin@example.com',
        userName: 'Sabrina Yasmin',
        joinedAt: new Date(),
      },
    ];

    await EventRegistration.insertMany(sampleRegistrations);
    console.log(`Created ${sampleRegistrations.length} sample registrations.`);

    console.log('\n=============================================');
    console.log(' Database Seeded Successfully!');
    console.log('=============================================');
    console.log('Test User Login Credentials:');
    usersData.forEach((u) => {
      console.log(` - Email: ${u.email} | Password: Password123`);
    });
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();

