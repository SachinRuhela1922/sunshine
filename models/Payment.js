const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: true
        },

        studentName: {
            type: String,
            required: true
        },

        fatherName: {
            type: String,
            default: ""
        },

        rollNumber: {
            type: String,
            default: ""
        },

        className: {
            type: String,
            default: ""
        },

        admissionNumber: {
            type: String,
            default: ""
        },

        amount: {
            type: Number,
            required: true
        },

        month: {
            type: String,
            required: true
        },
        monthlyFee: {
    type: Number,
    required: true
},
        paymentDate: {
            type: Date,
            required: true
        },

        dueAmount: {
            type: Number,
            default: 0
        },

        paymentMode: {
            type: String,
            default: "Cash"
        },

        transactionId: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payment", paymentSchema);