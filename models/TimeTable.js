const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
    {
        lectureNumber: {
            type: Number,
            required: true
        },

        from: {
            type: String,
            required: true
        },

        to: {
            type: String,
            required: true
        }
    },
    {
        _id: false
    }
);

const timeTableSchema = new mongoose.Schema(
    {
        season: {
            type: String,
            enum: ["Summer", "Winter"],
            required: true,
            unique: true
        },

        teacherTiming: {
            type: String,
            default: ""
        },

        studentTiming: {
            type: String,
            default: ""
        },

        prayerBell: {
            type: String,
            default: ""
        },

        lectures: {
            type: [lectureSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "TimeTable",
    timeTableSchema,
    "timetable"
);