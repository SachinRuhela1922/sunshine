const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["lecture", "lunch"],
            default: "lecture"
        },
        lectureNumber: {
            type: Number,
            required: false // Lunch break ke paas number nahi hoga
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