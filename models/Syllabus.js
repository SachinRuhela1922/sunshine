const mongoose = require("mongoose");

// ==========================================
// ONE SUBJECT ROW (subject + chapter range + extra note)
// ==========================================

const subjectEntrySchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: true,
            trim: true
        },

        chapterFrom: {
            type: String,
            default: ""
        },

        chapterTo: {
            type: String,
            default: ""
        },

        extra: {
            // "kuch aur likhna ho toh" - free text side note
            type: String,
            default: ""
        }
    },
    { _id: true }
);

// ==========================================
// SYLLABUS - ONE DOCUMENT PER CLASS
// Fixed terms: Unit 1, Unit 2, Half Yearly, Unit 3, Unit 4, Annual
// ==========================================

const syllabusSchema = new mongoose.Schema(
    {
        className: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        terms: {
            unit1: {
                type: [subjectEntrySchema],
                default: []
            },
            unit2: {
                type: [subjectEntrySchema],
                default: []
            },
            halfYearly: {
                type: [subjectEntrySchema],
                default: []
            },
            unit3: {
                type: [subjectEntrySchema],
                default: []
            },
            unit4: {
                type: [subjectEntrySchema],
                default: []
            },
            annual: {
                type: [subjectEntrySchema],
                default: []
            }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Syllabus", syllabusSchema);