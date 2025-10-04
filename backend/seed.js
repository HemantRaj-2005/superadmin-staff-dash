import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AdminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@example.com');
      console.log('You can now try logging in with password: password');
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('password', 12);
      
      const admin = new Admin({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true
      });

      await admin.save();
      console.log('✅ Admin user created successfully');
      console.log('Email: admin@example.com');
      console.log('Password: password');
    }

    // Create additional admin user
    const existingAdmin2 = await Admin.findOne({ email: 'manager@example.com' });
    if (!existingAdmin2) {
      const hashedPassword2 = await bcrypt.hash('password123', 12);
      const admin2 = new Admin({
        name: 'Manager Admin',
        email: 'manager@example.com',
        password: hashedPassword2,
        role: 'admin',
        isActive: true
      });
      await admin2.save();
      console.log('✅ Additional admin created');
      console.log('Email: manager@example.com');
      console.log('Password: password123');
    }

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

seedAdmin();