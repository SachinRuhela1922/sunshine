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
        },additionalFees: {
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

    redCrossFee: {
        type: Number,
        default: 0
    },

    scoutFee: {
        type: Number,
        default: 0
    },

    tieBalance: {
        type: Number,
        default: 0
    },

    beltBalance: {
        type: Number,
        default: 0
    },

    shirtPantBalance: {
        type: Number,
        default: 0
    }
}
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payment", paymentSchema);