const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true
        },

        className: {
            type: String,
            required: true
        },

        session: {
            type: String,
            default: ""
        },

        // Holiday support: whole class marked as holiday for the day
        isHoliday: {
            type: Boolean,
            default: false
        },

        // "Festival" | "General Holiday" | "Other"
        holidayReason: {
            type: String,
            default: ""
        },

        // Festival name typed by the user (e.g. Diwali, Holi)
        holidayName: {
            type: String,
            default: ""
        },

        students: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Student",
                    required: true
                },

                studentName: {
                    type: String,
                    required: true
                },

                rollNumber: {
                    type: String,
                    default: ""
                },

                status: {
                    type: String,
                    enum: ["Present", "Absent", "Holiday"],
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Attendance",
    attendanceSchema
);