const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            unique: true,
            required: true
        },

        studentName: {
            type: String,
            required: true,
            trim: true
        },

        admissionNumber: {
            type: String,
            unique: true,
            required: true
        },

        rollNumber: {
            type: String
        },

        // Date of birth is typed by hand and saved exactly as TEXT,
        // e.g. "21/05/2008", "21-05-2008", or just "2008" when only the year is known.
        // Mixed (not String) so old records that were saved as real Dates
        // are not damaged - they are shown as DD/MM/YYYY by the front-end.
        dob: {
            type: mongoose.Schema.Types.Mixed,
            default: "",
            set: v => (typeof v === "string" ? v.trim() : v)
        },

        gender: {
            type: String
        },

        bloodGroup: {
            type: String
        },

        nationality: {
            type: String
        },

        religion: {
            type: String
        },

        category: {
            type: String
        },

        academic: {
            session: String,
            class: String,
            section: String,
            previousClass: String,
            previousSchool: String,
            admissionDate: Date
        },

        father: {
            name: String,
            phone: String,
            email: String,
            occupation: String
        },

        mother: {
            name: String,
            phone: String,
            email: String,
            occupation: String
        },

        guardian: {
            name: String,
            relation: String,
            phone: String
        },

        contact: {
            phone: String,
            email: String,
            address: String,
            city: String,
            state: String,
            pinCode: String
        },
        marks: {
    subjects: {
        type: [String],
        default: []
    },

    exams: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
},

        fees: {
            monthlyFee: {
                type: Number,
                default: 0
            },

            admissionFee: {
                type: Number,
                default: 0
            },

            previousDue: {
                type: Number,
                default: 0
            },

            month: String,

            paid: {
                type: Number,
                default: 0
            },

            paymentMode: String,

            transactionId: String,

            status: {
                type: String,
                enum: ["Paid", "Partial", "Due"],
                default: "Due"
            }
        },

        medical: {
            conditions: String,
            allergies: String,
            emergencyContactName: String,
            emergencyContactNumber: String
        },

        documents: {
            birthCertificateNumber: String,
            aadhaarNumber: String,
            previousMarksheetNumber: String,
            transferCertificateNumber: String
        },

        status: {
            type: String,
            enum: [
                "active",
                "inactive",
                "passed",
                "transferred",
                "left"
            ],
            default: "active"
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Student", studentSchema);