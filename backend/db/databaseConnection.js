// import mongoose from 'mongoose';

// export const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log(`🗄️ MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error('💥 Database connection error:', error);
//     process.exit(1);
//   }
// };



import mongoose from 'mongoose';

// Create separate connections for two databases
export const mainDB = mongoose.createConnection();
export const adminDB = mongoose.createConnection();

export const connectDB = async () => {
  try {
    // Connect to Main Database (Users, Posts, Events, etc.)
    const mainConnection = await mainDB.openUri(process.env.MONGODB_URI_MAIN, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🗄️ Main Database Connected: ${mainConnection.host}`);

    // Connect to Admin Database (Admins, ActivityLogs, Roles)
    const adminConnection = await adminDB.openUri(process.env.MONGODB_URI_ADMIN, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🔐 Admin Database Connected: ${adminConnection.host}`);
  } catch (error) {
    console.error('💥 Database connection error:', error);
    process.exit(1);
  }
};