const mongoose = require("mongoose");

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/; // 24-hour "HH:mm"

const admitCardSchema = new mongoose.Schema(
    {
        exam: {
            type: String,
            required: true
        },

        className: {
            type: String,
            required: true
        },

        subjects: [
            {
                subject: {
                    type: String,
                    required: true
                },

                date: {
                    type: String,
                    required: true
                },

                day: {
                    type: String,
                    required: true
                },

                // e.g. "10:00"  (24-hour, from <input type="time">)
                startTime: {
                    type: String,
                    required: true,
                    match: [TIME_REGEX, "Start time must be in HH:mm format"]
                },

                // e.g. "13:00"
                endTime: {
                    type: String,
                    required: true,
                    match: [TIME_REGEX, "End time must be in HH:mm format"]
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

admitCardSchema.index(
    {
        exam: 1,
        className: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "AdmitCard",
    admitCardSchema,
    "admitcards"
);