const mongoose = require("mongoose");

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