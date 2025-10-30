import mongoose from "mongoose";

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

// Export the model
const EducationalProgram = model(
  "Educationalprogram",
  EducationalProgramSchema
);

export default EducationalProgram;
