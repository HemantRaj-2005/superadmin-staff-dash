// import mongoose from "mongoose";

// const { Schema, model } = mongoose;

// const EducationalProgramSchema = new Schema(
//   {
//     Program: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     Specialization: {
//       type: String,
//       required: true,
//       trim: true,
//     },
    
//   },
//   {
//     timestamps: true,
//   }
// );

// // Compound index to prevent duplicate Program+Specialization entries
// EducationalProgramSchema.index(
//   { Program: 1, Specialization: 1 },
//   { unique: true, background: true }
// );

// // Export the model
// const EducationalProgram = model(
//   "Educationalprogram",
//   EducationalProgramSchema
// );

// export default EducationalProgram;




import { mainDB } from '../db/databaseConnection.js'; // Changed import
import mongoose from 'mongoose'; // Import mongoose for Schema and model

const { Schema, model } = mongoose; 
const EducationalProgramSchema = new Schema(
  {
    Program: {
      type: String,
      required: true,
      trim: true,
    },
    Specialization: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate Program+Specialization entries
EducationalProgramSchema.index(
  { Program: 1, Specialization: 1 },
  { unique: true, background: true }
);

// Export the model using mainDB
const EducationalProgram = mainDB.model( // Changed to mainDB.model
  "Educationalprogram",
  EducationalProgramSchema
);

export default EducationalProgram;