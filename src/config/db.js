import mongoose from 'mongoose';
import dns from 'dns';

// Fix for DNS SRV lookup issues with MongoDB Atlas across platforms
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // fallback to system dns
}

const DEFAULT_MONGO_URI =
  'mongodb+srv://abdulaalnomanbd100_db_user:T4hSOkYzWCyk4DSP@cluster0.ebtgldz.mongodb.net/assignment8?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Do not call process.exit(1) so the HTTP server stays alive in cPanel Passenger
  }
};

export { connectDB };
export default connectDB;
