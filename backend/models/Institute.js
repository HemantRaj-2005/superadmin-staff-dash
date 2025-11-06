import mongoose from 'mongoose';

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

const Institute = mongoose.model('Institute', instituteSchema);

export default Institute;