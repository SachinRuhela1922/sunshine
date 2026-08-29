const mongoose = require("mongoose");

const subjectMarksSchema = new mongoose.Schema(
    {
        subjectName: {
            type: String,
            required: true
        },

        maxMarks: {
            type: Number,
            default: 0
        },

        obtainedMarks: {
    type: Number,
    default: 0
},

status: {
    type: String,
    enum: ["PRESENT", "ABSENT"],
    default: "PRESENT"
}
    },
    {
        _id: false
    }
);

const examMarksSchema = new mongoose.Schema(
    {
        exam: {
            type: String,
            required: true
        },

        className: {
            type: String,
            required: true
        },

        studentMongoId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        studentId: {
            type: String,
            default: ""
        },

        studentName: {
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

        rollNumber: {
            type: String,
            default: ""
        },

        admissionNumber: {
            type: String,
            default: ""
        },

        phone: {
            type: String,
            default: ""
        },

        penNumber: {
            type: String,
            default: ""
        },

        dob: {
            type: String,
            default: ""
        },

        address: {
            type: String,
            default: ""
        },

        gender: {
            type: String,
            default: ""
        },

        marks: {
            type: [subjectMarksSchema],
            default: []
        },

        totalMaxMarks: {
            type: Number,
            default: 0
        },

        totalObtainedMarks: {
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
        division: {
    type: String,
    default: "",
    enum: ["", "Ist Division", "IInd Division", "IIIrd Division", "Fail","Pass"]
}
    },
    {
        timestamps: true
    }
);

examMarksSchema.index(
    {
        exam: 1,
        className: 1,
        studentMongoId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "ExamMarks",
    examMarksSchema,
    "exammarks"
);