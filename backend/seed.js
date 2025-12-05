// server/scripts/seedAdminWithRBAC.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const AdminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: mongoose.Schema.Types.ObjectId,
  isActive: Boolean
});

const RoleSchema = new mongoose.Schema({
  name: String,
  description: String,
  permissions: [{
    resource: String,
    actions: [String]
  }],
  isDefault: Boolean,
  isActive: Boolean,
  createdBy: mongoose.Schema.Types.ObjectId
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);

const seedAdminWithRBAC = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI_ADMIN || 'mongodb://localhost:27017/admin-panel');
    console.log('Connected to MongoDB');

    // Create default roles
    const defaultRoles = [
      {
        name: 'Super Admin',
        description: 'Full access to all features and admin management',
        permissions: [
          { resource: 'users', actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'] },
          { resource: 'posts', actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'] },
          { resource: 'events', actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'] },
          { resource: 'activity_logs', actions: ['view', 'export', 'manage'] },
          { resource: 'settings', actions: ['view', 'edit', 'manage'] },
          { resource: 'roles', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
          { resource: 'schools', actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'] },
          { resource: 'cities', actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'] },
          { resource: 'educational-programs', actions: ['view', 'create', 'edit', 'delete', 'export', 'manage'] },




        ],
        isDefault: true,
        isActive: true
      },
      {
        name: 'User Manager',
        description: 'Manage users and their data',
        permissions: [
          { resource: 'users', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { resource: 'posts', actions: ['view'] },
          { resource: 'events', actions: ['view'] }
        ],
        isDefault: true,
        isActive: true
      },
      {
        name: 'Content Moderator',
        description: 'Manage posts and content',
        permissions: [
          { resource: 'users', actions: ['view'] },
          { resource: 'posts', actions: ['view', 'edit', 'delete'] },
          { resource: 'events', actions: ['view', 'edit', 'delete'] }
        ],
        isDefault: true,
        isActive: true
      },
      {
        name: 'Viewer',
        description: 'View-only access to all data',
        permissions: [
          { resource: 'users', actions: ['view'] },
          { resource: 'posts', actions: ['view'] },
          { resource: 'events', actions: ['view'] }
        ],
        isDefault: true,
        isActive: true
      }
    ];

    // Create roles
    const createdRoles = {};
    for (const roleData of defaultRoles) {
      let role = await Role.findOne({ name: roleData.name });
      if (!role) {
        role = new Role(roleData);
        await role.save();
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`✅ Role already exists: ${roleData.name}`);
      }
      createdRoles[roleData.name] = role;
    }

    // Create super admin
    const superAdminEmail = 'superadmin@gmail.com';
    let superAdmin = await Admin.findOne({ email: superAdminEmail });

    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash('password', 12);
      superAdmin = new Admin({
        name: 'Super Administrator',
        email: superAdminEmail,
        password: hashedPassword,
        role: createdRoles['Super Admin']._id,
        isActive: true
      });
      await superAdmin.save();
      console.log('✅ Super Admin created successfully');
    } else {
      // Update existing super admin to use role reference
      superAdmin.role = createdRoles['Super Admin']._id;
      await superAdmin.save();
      console.log('✅ Super Admin updated with RBAC role');
    }

    // Create sample admins with different roles
    const sampleAdmins = [
      {
        name: 'User Manager Admin',
        email: 'usermanager@gmail.com',
        password: 'password123',
        role: createdRoles['User Manager']._id,
        isActive: true
      },
      {
        name: 'Content Moderator Admin',
        email: 'moderator@gmail.com',
        password: 'password123',
        role: createdRoles['Content Moderator']._id,
        isActive: true
      },
      {
        name: 'View Only Admin',
        email: 'viewer@gmail.com',
        password: 'password123',
        role: createdRoles['Viewer']._id,
        isActive: true
      }
    ];

    for (const adminData of sampleAdmins) {
      let admin = await Admin.findOne({ email: adminData.email });
      if (!admin) {
        const hashedPassword = await bcrypt.hash(adminData.password, 12);
        admin = new Admin({
          ...adminData,
          password: hashedPassword
        });
        await admin.save();
        console.log(`✅ Created ${adminData.name}`);
      }
    }

    console.log('\n🎉 RBAC System Setup Complete!');
    console.log('\n📋 Default Login Credentials:');
    console.log('Super Admin: superadmin@gmail.com / password');
    console.log('User Manager: usermanager@gmail.com / password123');
    console.log('Content Moderator: moderator@gmail.com / password123');
    console.log('View Only: viewer@gmail.com / password123');

  } catch (error) {
    console.error('❌ Error seeding admin with RBAC:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedAdminWithRBAC();
