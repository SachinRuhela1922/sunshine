const mongoose = require("mongoose");


/* ================= CLASS TIMETABLE ================= */

const classTimetableSchema = new mongoose.Schema(
    {
        teacherId: {
            type: String,
            default: ""
        },

        teacherName: {
            type: String,
            default: ""
        },

        subject: {
            type: String,
            default: ""
        }
    },
    {
        _id: false
    }
);


/* ================= LECTURE ================= */

const lectureSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["lecture", "lunch"],
            default: "lecture"
        },

        lectureNumber: {
            type: Number,
            required: false
        },

        from: {
            type: String,
            required: true
        },

        to: {
            type: String,
            required: true
        },

        classes: {
            type: Map,
            of: classTimetableSchema,
            default: {}
        }
    },
    {
        _id: false
    }
);


/* ================= TIMETABLE ================= */

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


/* ================= MODEL ================= */

module.exports = mongoose.model(
    "TimeTable",
    timeTableSchema,
    "timetable"
);