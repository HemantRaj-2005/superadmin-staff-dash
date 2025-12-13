// // server/index.js
// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Routes
// import postRoutes from './routes/post.js';
// import authRoutes from './routes/auth.js';
// import adminRoutes from './routes/admin.js';
// import statsRoutes from './routes/stats.js';
// import eventRoutes from './routes/event.js'
// import activityLogRoutes from './routes/activityLogs.js'
// import roleRoutes from './routes/role.js'
// import adminManagementRoutes from './routes/adminManagement.js'
// import commentRoutes from './routes/comments.js'
// import schoolRoutes from './routes/schools.js';
// import educationalProgram from './routes/educationalPrograms.js'
// import city from './routes/worldCity.js'
// import organisation from './routes/organisation.js'
// import institute from './routes/institute.js'
// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();

// //ip setup
// app.set('trust proxy', true);
// const trustProxyConfig = process.env.NODE_ENV === 'production' 
//   ? true  // Trust all proxies in production
//   : 'loopback'; // Only trust loopback in development
// app.set('trust proxy', trustProxyConfig);
// // Or for specific hosting platforms:
// const getTrustProxySetting = () => {
//   if (process.env.VERCEL) return true;
//   if (process.env.HEROKU) return true; 
//   if (process.env.AWS_EXECUTION_ENV) return true; // AWS
//   if (process.env.NODE_ENV === 'production') return true;
//   return 'loopback';
// };

// app.set('trust proxy', getTrustProxySetting());

// // Middleware
// const allowedOrigins = ['https://superadmin-staff-dash.vercel.app', 'http://localhost:3000'];
// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) callback(null, true);
//     else callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(express.static(path.join(__dirname, '../client/build')));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/admin/posts', postRoutes);
// app.use('/api/admin/stats', statsRoutes);
// app.use('/api/admin/events', eventRoutes);
// app.use('/api/admin/activity-logs', activityLogRoutes);
// app.use('/api/admin/roles', roleRoutes);
// app.use('/api/admin/admins', adminManagementRoutes);
// app.use('/api/admin/comments', commentRoutes);
// app.use('/api/admin/schools', schoolRoutes);
// app.use('/api/admin/educational-programs',educationalProgram)
// app.use('/api/admin/cities',city)
// app.use('/api/admin/organisations',organisation)
// app.use('/api/admin/institutes',organisation)








// // Serve React app in production
// if (process.env.NODE_ENV === 'production') {
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/build/index.html'));
//   });
// }

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something went wrong!' });
// });

// // 404 handler
// app.use('/', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// const PORT = process.env.PORT || 5000;

// // Database connection and server start
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-panel')
// .then(() => {
//     console.log('Connected to MongoDB');
//     app.listen(PORT,() => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   });
  
//   app.set('trust proxy', 1);
//   export default app;




import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import the database connections
import { connectDB, mainDB, adminDB } from './db/databaseConnection.js';

// Routes
import postRoutes from './routes/post.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import statsRoutes from './routes/stats.js';
import eventRoutes from './routes/event.js';
import activityLogRoutes from './routes/activityLogs.js';
import roleRoutes from './routes/role.js';
import adminManagementRoutes from './routes/adminManagement.js';
import commentRoutes from './routes/comments.js';
import schoolRoutes from './routes/schools.js';
import educationalProgram from './routes/educationalPrograms.js';
import city from './routes/worldCity.js';
import organisation from './routes/organisation.js';
import institute from './routes/institute.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// IP setup
app.set('trust proxy', true);
const trustProxyConfig = process.env.NODE_ENV === 'production' 
  ? true  // Trust all proxies in production
  : 'loopback'; // Only trust loopback in development
app.set('trust proxy', trustProxyConfig);

// Or for specific hosting platforms:
const getTrustProxySetting = () => {
  if (process.env.VERCEL) return true;
  if (process.env.HEROKU) return true; 
  if (process.env.AWS_EXECUTION_ENV) return true; // AWS
  if (process.env.NODE_ENV === 'production') return true;
  return 'loopback';
};

app.set('trust proxy', getTrustProxySetting());

// Middleware
const allowedOrigins = ['https://superadmin-staff-dash.vercel.app', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/build')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/posts', postRoutes);
app.use('/api/admin/stats', statsRoutes);
app.use('/api/admin/events', eventRoutes);
app.use('/api/admin/activity-logs', activityLogRoutes);
app.use('/api/admin/roles', roleRoutes);
app.use('/api/admin/admins', adminManagementRoutes);
app.use('/api/admin/comments', commentRoutes);
app.use('/api/admin/schools', schoolRoutes);
app.use('/api/admin/educational-programs', educationalProgram);
app.use('/api/admin/cities', city);
app.use('/api/admin/organisations', organisation);
app.use('/api/admin/institutes', institute);




// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('/', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Database connection and server start
const startServer = async () => {
  try {
    // Connect to both databases
    await connectDB();
    
    console.log('✅ Connected to both databases');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('💥 Failed to connect to databases:', error);
    process.exit(1);
  }
};

startServer();

export default app;