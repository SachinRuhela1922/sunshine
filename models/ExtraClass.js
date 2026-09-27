const mongoose = require("mongoose");

// ==========================================
// ONE ROW OF MARKS (subject + max + obtained)
// Used inside every term (unit1, unit2, halfYearly, unit3, unit4, annual)
// ==========================================

const markRowSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            default: ""
        },

        maxMarks: {
            type: Number,
            default: 0
        },

        obtainedMarks: {
            type: Number,
            default: 0
        }
    },
    {
        _id: false
    }
);

// ==========================================
// ALL TERMS FOR ONE STUDENT
// Fixed term keys (same as Syllabus): unit1, unit2, halfYearly, unit3, unit4, annual
// Every term holds an array of markRowSchema (one row per subject).
// Subjects are kept in sync across every term from the front-end, so
// adding "Maths" in Unit 1 also creates a "Maths" row (0/0) in every
// other term automatically.
// ==========================================

const marksSchema = new mongoose.Schema(
    {
        unit1: {
            type: [markRowSchema],
            default: []
        },
        unit2: {
            type: [markRowSchema],
            default: []
        },
        halfYearly: {
            type: [markRowSchema],
            default: []
        },
        unit3: {
            type: [markRowSchema],
            default: []
        },
        unit4: {
            type: [markRowSchema],
            default: []
        },
        annual: {
            type: [markRowSchema],
            default: []
        }
    },
    {
        _id: false
    }
);

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        rollNumber: {
            type: String,
            default: ""
        },

        // S.R Number (School Register Number) - shown on the students table & PDF
        srNumber: {
            type: String,
            default: ""
        },

        admissionNumber: {
            type: String,
            default: ""
        },

        fatherName: {
            type: String,
            default: ""
        },

        motherName: {
            type: String,
            default: ""
        },

        // Father's occupation - shown on the students table & PDF
        fatherOccupation: {
            type: String,
            default: ""
        },

        phone: {
            type: String,
            default: ""
        },

        alternatePhone: {
            type: String,
            default: ""
        },

        // ---- NEW IDENTITY FIELDS ----

        penNumber: {
            type: String,
            default: ""
        },

        aadharNumber: {
            type: String,
            default: ""
        },

        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true
        },

        // Caste - shown on the students table & PDF
        caste: {
            type: String,
            default: ""
        },

        // Category (General / OBC / SC / ST / EWS ...) - shown on the students table & PDF
        category: {
            type: String,
            default: ""
        },

        // Student's current school class / grade (e.g. "6th", "10th").
        // This is separate from the Extra Class's own name (extraClassSchema.className) -
        // shown on the students table, profile view, filter dropdown & PDF.
        studentClass: {
            type: String,
            default: ""
        },

        // ------------------------------

        dob: {
            type: String,
            default: ""
        },

        gender: {
            type: String,
            default: ""
        },

        address: {
            type: String,
            default: ""
        },

        // ---- FEES (flat, matches the form) ----

        monthlyFee: {
            type: Number,
            default: 0
        },

        registrationFee: {
            type: Number,
            default: 0
        },

        conveyanceFee: {
            type: Number,
            default: 0
        },

        bookFee: {
            type: Number,
            default: 0
        },

        stationaryFee: {
            type: Number,
            default: 0
        },

        examFee: {
            type: Number,
            default: 0
        },

        // ---- ACADEMIC / RESULT (subject-wise, per term) ----

        marks: {
            type: marksSchema,
            default: () => ({})
        },

        // Kept ONLY so old flat numbers already saved in the database
        // are not lost. New data should be entered through "marks" above.
        unitTest1: {
            type: Number,
            default: 0
        },

        unitTest2: {
            type: Number,
            default: 0
        },

        halfYearly: {
            type: Number,
            default: 0
        },

        annualExam: {
            type: Number,
            default: 0
        },

        totalMarks: {
            type: Number,
            default: 0
        },

        percentage: {
            type: Number,
            default: 0
        },

        result: {
            type: String,
            default: ""
        },

        grade: {
            type: String,
            default: ""
        },

        remarks: {
            type: String,
            default: ""
        },

        // ---- OTHER ----

        attendance: {
            type: Number,
            default: 0
        },

        scholarship: {
            type: String,
            default: ""
        },

        transport: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const extraClassSchema = new mongoose.Schema(
    {
        className: {
            type: String,
            required: true,
            unique: true
        },

        description: {
            type: String,
            default: ""
        },

        academicYear: {
            type: String,
            default: ""
        },

        students: [studentSchema]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ExtraClass",
    extraClassSchema
);