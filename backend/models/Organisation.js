// import mongoose from 'mongoose';

// const { Schema, model } = mongoose;

// const OrganisationSchema = new Schema(
//   {
//     establishmentYear: {
//       type: Schema.Types.Mixed,
//       validate: {
//         validator: function (v) {
//           return (
//             (typeof v === 'number' && Number.isInteger(v)) ||
//             typeof v === 'boolean' ||
//             typeof v === 'string' ||
//             v === null ||
//             v === undefined
//           );
//         },
//         message: 'establishmentYear must be an integer, boolean, string, null or undefined',
//       },
//       default: undefined,
//     },

//     industry: {
//       type: String,
//       required: [true, 'industry is required'],
//       trim: true,
//     },

//     location: {
//       type: new Schema(
//         {
//           country: { type: String, required: [true, 'location.country is required'], trim: true },
//         },
//         { _id: false }
//       ),
//       required: [true, 'location is required'],
//     },

//     name: {
//       type: String,
//       required: [true, 'name is required'],
//       trim: true,
//     },

//     type: {
//       type: String,
//       required: [true, 'type is required'],
//       trim: true,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: {
//       virtuals: true,
//       transform(doc, ret) {
//         ret.id = ret._id;
//         delete ret._id;
//         delete ret.__v;
//       },
//     },
//   }
// );

// const Organisation = model('Organization', OrganisationSchema);

// export default Organisation;



import { mainDB } from '../db/databaseConnection.js'; // Changed import
import mongoose from 'mongoose'; // Import mongoose for Schema and model

const { Schema, model } = mongoose; 
const OrganisationSchema = new Schema(
  {
    establishmentYear: {
      type: Schema.Types.Mixed,
      validate: {
        validator: function (v) {
          return (
            (typeof v === 'number' && Number.isInteger(v)) ||
            typeof v === 'boolean' ||
            typeof v === 'string' ||
            v === null ||
            v === undefined
          );
        },
        message: 'establishmentYear must be an integer, boolean, string, null or undefined',
      },
      default: undefined,
    },
    industry: {
      type: String,
      required: [true, 'industry is required'],
      trim: true,
    },
    location: {
      type: new Schema(
        {
          country: { type: String, required: [true, 'location.country is required'], trim: true },
        },
        { _id: false }
      ),
      required: [true, 'location is required'],
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'type is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Changed to mainDB.model
const Organisation = mainDB.model('Organization', OrganisationSchema);

export default Organisation;