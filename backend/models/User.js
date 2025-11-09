// // models/User.js
// import mongoose from 'mongoose';

// const { Schema } = mongoose;


// const AddressSchema = new Schema({
//   street: { type: String, required: true },
//   city:   { type: String, required: true },
//   state:  { type: String, required: true },
//   country: { type: String, required: true },
//   postalCode: { type: Number, required: true }
// }, { _id: false });

// const EducationItemSchema = new Schema({
//   _id: { type: String, required: true },
//   board: { type: String },
//   city: { type: String, required: true },
//   completionYear: { type: Date, required: true },
//   institute: { type: String },
//   medium: { type: String },
//   otherInstitute: { type: String },
//   otherUniversity: { type: String },
//   percentageOrCGPA: { type: Schema.Types.Mixed }, // int or dobule 
//   pincode: { type: Number, required: true },
//   program: { type: String },
//   programType: { type: String },
//   qualification: { type: String, required: true },
//   school: { type: String },
//   specialization: { type: String, required: true },
//   startYear: { type: Date, required: true },
//   state: { type: String, required: true },
//   university: { type: String }
// }, { _id: false });

// const ProfessionalItemSchema = new Schema({
//   _id: { type: String, required: true },
//   companyName: { type: String, required: true },
//   completionYear: { type: Date },
//   currentEmployment: { type: Boolean, required: true },
//   designation: { type: String, required: true },
//   employmentType: { type: String, required: true },
//   location: { type: String, required: true },
//   salaryBand: { type: Number },
//   startYear: { type: Date, required: true }
// }, { _id: false });

// const RefreshTokenSchema = new Schema({
//   _id: { type: String, required: true },
//   token: { type: String, required: true }
// }, { _id: false });

// const SocialLinksSchema = new Schema({
//   linkedin: { type: String, required: true }
// }, { _id: false });

// /**
//  * Main User schema
//  * Note: Mongoose will automatically create _id and __v.
//  * We enable timestamps so createdAt is present.
//  */
// const UserSchema = new Schema({
//   // _id - auto-managed by mongoose (ObjectId)
//   // __v - auto-managed by mongoose (versionKey)

//   address: { type: AddressSchema, required: false },

//   backgroundImage: { type: String },
//   bio: { type: String },

//   // createdAt will be added by timestamps option
//   dateOfBirth: { type: Date },

//   education: { type: [EducationItemSchema], default: [] },

//   email: { type: String, required: true, lowercase: true, trim: true },

//   emailNotifications: { type: Boolean, default: false },

//   firstName: { type: String, required: true },
//   gender: { type: String },

//   googleId: { type: String },

//   introLine: { type: String },

//   isEmailPrivate: { type: Boolean, default: false },
//   isEmailVerified: { type: Boolean, required: true, default: false },

//   isGoogleUser: { type: Boolean, default: false },
//   isMobilePrivate: { type: Boolean, default: false },

//   isPhoneVerified: { type: Boolean, required: true, default: false },

//   lastName: { type: String, required: true },

//   mobileNumber: { type: Number },

//   otp: { type: Number },
//   otpExpires: { type: Date },
//   otpVerificationId: { type: Number },

//   password: { type: String },

//   professional: { type: [ProfessionalItemSchema], default: [] },

//   profileImage: { type: String },

//   refreshTokens: { type: [RefreshTokenSchema], default: [] },

//   role: { type: String, required: true },

//   socialLinks: { type: SocialLinksSchema, required: false }
// }, {
//   timestamps: true, 
// });


// const User = mongoose.model('User', UserSchema);
// export default User;





// models/User.js - Updated with soft delete
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
  percentageOrCGPA: { type: Schema.Types.Mixed },
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

const UserSchema = new Schema({
  address: { type: AddressSchema, required: false },
  backgroundImage: { type: String },
  bio: { type: String },
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
  
  // Soft delete fields
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  scheduledForPermanentDeletion: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
});

// Index for efficient querying of soft-deleted users
UserSchema.index({ isDeleted: 1, deletedAt: 1 });
UserSchema.index({ scheduledForPermanentDeletion: 1 });

// Middleware to exclude soft-deleted users from normal queries
UserSchema.pre(/^find/, function(next) {
  // Only include non-deleted users in normal queries
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
  next();
});

// Static method to find including deleted users
UserSchema.statics.findIncludingDeleted = function(conditions = {}) {
  return this.find(conditions).where({ isDeleted: { $in: [true, false] } });
};

// Static method to find only deleted users
UserSchema.statics.findDeleted = function(conditions = {}) {
  return this.find(conditions).where({ isDeleted: true });
};

// Instance method to soft delete user
UserSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.scheduledForPermanentDeletion = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
  return this.save();
};

// Instance method to restore user
UserSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.scheduledForPermanentDeletion = null;
  return this.save();
};

// Virtual for checking if user is scheduled for permanent deletion
UserSchema.virtual('daysUntilPermanentDeletion').get(function() {
  if (!this.scheduledForPermanentDeletion) return null;
  const now = new Date();
  const diffTime = this.scheduledForPermanentDeletion - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

const User = mongoose.model('User', UserSchema);
export default User;