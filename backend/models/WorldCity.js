// // models/WorldCity.model.js
// import mongoose from "mongoose";

// const { Schema, model } = mongoose;

// const CitySchema = new Schema(
//   {
//     city_id: {
//       type: Number,
//       required: true,
//       unique: true,
//     },

//     CITY_latitude: {
//       type: Number,
//       required: true,
//     },

//     CITY_longitude: {
//       type: Number,
//       required: true,
//     },

//     CITY_NAME: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     country_code: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     country_id: {
//       type: Number,
//       required: true,
//     },

//     COUNTRY_ISO_2: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     COUNTRY_ISO_3: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     COUNTRY_NAME_CODE: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     COUNTRY_REGION2: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     COUNTRY_SUBREGION: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     STATE: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // JSON schema allows string OR int for state_code.
//     // We store it as String to preserve leading zeros / mixed types.
//     state_code: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     state_id: {
//       type: Number,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // useful indexes
// CitySchema.index({ city_id: 1 }, { unique: true });
// CitySchema.index({ country_id: 1, state_id: 1 });
// CitySchema.index({ CITY_latitude: 1, CITY_longitude: 1 }); // for basic coords queries

// const WorldCity = model("Worldcity", CitySchema);

// export default WorldCity;




import { mainDB } from '../db/databaseConnection.js'; // Changed import
import mongoose from 'mongoose'; // Import mongoose for Schema and model

const { Schema, model } = mongoose; 
const CitySchema = new Schema(
  {
    city_id: {
      type: Number,
      required: true,
      unique: true,
    },
    CITY_latitude: {
      type: Number,
      required: true,
    },
    CITY_longitude: {
      type: Number,
      required: true,
    },
    CITY_NAME: {
      type: String,
      required: true,
      trim: true,
    },
    country_code: {
      type: String,
      required: true,
      trim: true,
    },
    country_id: {
      type: Number,
      required: true,
    },
    COUNTRY_ISO_2: {
      type: String,
      required: true,
      trim: true,
    },
    COUNTRY_ISO_3: {
      type: String,
      required: true,
      trim: true,
    },
    COUNTRY_NAME_CODE: {
      type: String,
      required: true,
      trim: true,
    },
    COUNTRY_REGION2: {
      type: String,
      required: true,
      trim: true,
    },
    COUNTRY_SUBREGION: {
      type: String,
      required: true,
      trim: true,
    },
    STATE: {
      type: String,
      required: true,
      trim: true,
    },
    state_code: {
      type: String,
      required: true,
      trim: true,
    },
    state_id: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CitySchema.index({ city_id: 1 }, { unique: true });
CitySchema.index({ country_id: 1, state_id: 1 });
CitySchema.index({ CITY_latitude: 1, CITY_longitude: 1 });

const WorldCity = mainDB.model("Worldcity", CitySchema); // Changed to mainDB.model

export default WorldCity;

