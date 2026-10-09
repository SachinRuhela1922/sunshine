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

                // OPTIONAL. e.g. "10:00" (24-hour) or "" when not set
                startTime: {
                    type: String,
                    default: "",
                    validate: {
                        validator: v => v === "" || TIME_REGEX.test(v),
                        message: "Start time must be in HH:mm format"
                    }
                },

                // OPTIONAL. e.g. "13:00" or "" when not set
                endTime: {
                    type: String,
                    default: "",
                    validate: {
                        validator: v => v === "" || TIME_REGEX.test(v),
                        message: "End time must be in HH:mm format"
                    }
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