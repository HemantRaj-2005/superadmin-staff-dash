// models/model.user.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city:   { type: String, required: true },
  state:  { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: Number, required: true }
}, { _id: false });

const EducationItemSchema = new Schema({
  _id: { type: String, required: true },
  board: { type: String },
  city: { type: String, required: true },
  completionYear: { type: Date, required: true },
  institute: { type: String },
  medium: { type: String },
  otherInstitute: { type: String },
  otherUniversity: { type: String },
  percentageOrCGPA: { type: Schema.Types.Mixed }, // int or dobule 
  pincode: { type: Number, required: true },
  program: { type: String },
  programType: { type: String },
  qualification: { type: String, required: true },
  school: { type: String },
  specialization: { type: String, required: true },
  startYear: { type: Date, required: true },
  state: { type: String, required: true },
  university: { type: String }
}, { _id: false });

const ProfessionalItemSchema = new Schema({
  _id: { type: String, required: true },
  companyName: { type: String, required: true },
  completionYear: { type: Date },
  currentEmployment: { type: Boolean, required: true },
  designation: { type: String, required: true },
  employmentType: { type: String, required: true },
  location: { type: String, required: true },
  salaryBand: { type: Number },
  startYear: { type: Date, required: true }
}, { _id: false });

const RefreshTokenSchema = new Schema({
  _id: { type: String, required: true },
  token: { type: String, required: true }
}, { _id: false });

const SocialLinksSchema = new Schema({
  linkedin: { type: String, required: true }
}, { _id: false });

/**
 * Main User schema
 * Note: Mongoose will automatically create _id and __v.
 * We enable timestamps so createdAt is present.
 */
const UserSchema = new Schema({
  // _id - auto-managed by mongoose (ObjectId)
  // __v - auto-managed by mongoose (versionKey)

  address: { type: AddressSchema, required: false },

  backgroundImage: { type: String },
  bio: { type: String },

  // createdAt will be added by timestamps option
  dateOfBirth: { type: Date },

  education: { type: [EducationItemSchema], default: [] },

  email: { type: String, required: true, lowercase: true, trim: true },

  emailNotifications: { type: Boolean, default: false },

  firstName: { type: String, required: true },
  gender: { type: String },

  googleId: { type: String },

  introLine: { type: String },

  isEmailPrivate: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, required: true, default: false },

  isGoogleUser: { type: Boolean, default: false },
  isMobilePrivate: { type: Boolean, default: false },

  isPhoneVerified: { type: Boolean, required: true, default: false },

  lastName: { type: String, required: true },

  mobileNumber: { type: Number },

  otp: { type: Number },
  otpExpires: { type: Date },
  otpVerificationId: { type: Number },

  password: { type: String },

  professional: { type: [ProfessionalItemSchema], default: [] },

  profileImage: { type: String },

  refreshTokens: { type: [RefreshTokenSchema], default: [] },

  role: { type: String, required: true },

  socialLinks: { type: SocialLinksSchema, required: false },

  // SOFT DELETE FIELDS - ADD THESE
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, 
});

// Add this middleware to automatically filter out deleted users
UserSchema.pre(/^find/, function(next) {
  // Only include this check if we're not explicitly asking for deleted users
  if (!this.getOptions().withDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// Add static methods for soft delete operations
UserSchema.statics.softDelete = function(query) {
  return this.updateMany(query, {
    $set: {
      isDeleted: true,
      deletedAt: new Date()
    }
  });
};

UserSchema.statics.restore = function(query) {
  return this.updateMany(query, {
    $set: {
      isDeleted: false,
      deletedAt: null
    }
  });
};

// Method to include deleted documents in query
UserSchema.statics.findWithDeleted = function(conditions = {}) {
  return this.find(conditions).withDeleted();
};

// Method to permanently delete users deleted more than 90 days ago
UserSchema.statics.permanentDeleteOldRecords = async function() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const result = await this.deleteMany({
    isDeleted: true,
    deletedAt: { $lte: ninetyDaysAgo }
  });
  
  return result;
};

const User = mongoose.model('User', UserSchema);
export default User;