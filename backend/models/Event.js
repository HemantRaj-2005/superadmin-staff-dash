// // models/Event.js
// import mongoose from 'mongoose';
// const { Schema, model } = mongoose;

// const EventSchema = new Schema({
//   event_title: {
//     type: String,
//     required: true
//   },
//   event_description: {
//     type: String,
//     required: true
//   },
//   event_type: {
//     type: String,
//     required: true
//   },
//   location: {
//     type: String,
//     required: true
//   },
//   posted_by: {
//     // keep as string per your schema; change to ObjectId/ref: 'User' if you store user ids
//     type: String,
//     required: true
//   },
//   unique_event_code: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true
//   },
//   is_paid: {
//     type: Boolean,
//     required: true,
//     default: false
//   },
//   price: {
//     type: Number,
//     required: true,
//     default: 0
//   },
//   event_start_datetime: {
//     type: Date,
//     required: true
//   },
//   event_end_datetime: {
//     type: Date,
//     required: true
//   },
//   status: {
//     type: String,
//     required: true,
//     default: 'active' // adjust as needed (e.g. 'draft', 'cancelled')
//   },
//   views: {
//     type: Number,
//     required: true,
//     default: 0
//   }
// }, {
//   timestamps: true,   // adds createdAt and updatedAt
// });

// // optional: compound/index suggestions (uncomment if desired)
// // EventSchema.index({ event_start_datetime: 1 });
// // EventSchema.index({ posted_by: 1 });

// export default model('Event', EventSchema);



import { mainDB } from '../db/databaseConnection.js'; // Changed import
import mongoose from 'mongoose'; // Import mongoose for Schema and model

const { Schema, model } = mongoose; 
const EventSchema = new Schema({
  event_title: {
    type: String,
    required: true
  },
  event_description: {
    type: String,
    required: true
  },
  event_type: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  posted_by: {
    type: String,
    required: true
  },
  unique_event_code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  is_paid: {
    type: Boolean,
    required: true,
    default: false
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  event_start_datetime: {
    type: Date,
    required: true
  },
  event_end_datetime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'active'
  },
  views: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true,
});

// Optional indexes
EventSchema.index({ event_start_datetime: 1 });
EventSchema.index({ posted_by: 1 });

// Export model using mainDB
export default mainDB.model('Event', EventSchema); // Changed to mainDB.model