const mongoose = require("mongoose");

// ==========================================
// ONE ROW PER TEACHER, FOR A GIVEN DATE
// ==========================================
const teacherAttendanceEntrySchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        },

        teacherId: {
            type: String,
            default: ""
        },

        employeeId: {
            type: String,
            default: ""
        },

        name: {
            type: String,
            required: true
        },

        department: {
            type: String,
            default: ""
        },

        // "Present" | "Absent" | "Half Day"
        status: {
            type: String,
            enum: ["Present", "Absent", "Half Day"],
            default: "Present"
        },

        inTime: {
            type: String, // e.g. "09:15"
            default: ""
        },

        outTime: {
            type: String, // e.g. "16:00"
            default: ""
        }
    },
    { _id: false }
);

// ==========================================
// ONE DOCUMENT PER DATE
// ==========================================
const teacherAttendanceSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true
        },

        teachers: {
            type: [teacherAttendanceEntrySchema],
            default: []
        }
    },
    { timestamps: true }
);

// Ek date ka sirf ek hi attendance document rahe
teacherAttendanceSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model(
    "TeacherAttendance",
    teacherAttendanceSchema
);