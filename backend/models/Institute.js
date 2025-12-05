// import mongoose from 'mongoose';

// const instituteSchema = new mongoose.Schema({
//     city: {
//         type: String
//     },
//     City: {
//         type: String
//     },
//     Hospitals: {
//         type: String
//     },
//     name: {
//         type: String
//     },
//     state: {
//         type: String
//     },
//     State: {
//         type: String
//     }
// }, {
//     timestamps: true 
// });

// const Institute = mongoose.model('Institute', instituteSchema);

// export default Institute;


import { mainDB } from '../db/databaseConnection.js'; // Changed import
import mongoose from 'mongoose'; // Import mongoose

// Use mongoose.Schema, not mainDB.Schema
const instituteSchema = new mongoose.Schema({
    city: {
        type: String
    },
    City: {
        type: String
    },
    Hospitals: {
        type: String
    },
    name: {
        type: String
    },
    state: {
        type: String
    },
    State: {
        type: String
    }
}, {
    timestamps: true 
});

// Use mainDB.model, not mongoose.model
const Institute = mainDB.model('Institute', instituteSchema);

export default Institute;