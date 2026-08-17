const mongoose = require("mongoose");

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

        // ---- ACADEMIC (flat, matches the form) ----

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