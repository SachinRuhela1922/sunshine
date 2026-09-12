const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
    {
        teacherId: {
            type: String,
            unique: true,
            required: true
        },

        employeeId: {
            type: String,
            unique: true,
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        fatherName: {
            type: String,
            trim: true
        },

        motherName: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true
        },

        phone: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            default: "teacher"
        },

        gender: {
            type: String
        },

        qualification: {
            type: String
        },

        joiningDate: {
            type: Date
        },

        status: {
            type: String,
            default: "active"
        },

        assignedClasses: [
            {
                class: String,
                sections: [String],
                subjects: [String]
            }
        ],

        permissions: {
            viewStudents: {
                type: Boolean,
                default: true
            },

            markAttendance: {
                type: Boolean,
                default: true
            },

            viewAttendance: {
                type: Boolean,
                default: true
            },

            enterMarks: {
                type: Boolean,
                default: true
            },

            editMarks: {
                type: Boolean,
                default: true
            },

            viewResults: {
                type: Boolean,
                default: true
            },

            viewFees: {
                type: Boolean,
                default: false
            },

            manageFees: {
                type: Boolean,
                default: false
            },

            generateAdmitCard: {
                type: Boolean,
                default: false
            }
        },

        profile: {
            address: String,
            bloodGroup: String,
            profilePhoto: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Teacher", teacherSchema);