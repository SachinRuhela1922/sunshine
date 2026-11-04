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

        // Display label, e.g. "November" or "November + January"
        month: {
            type: String,
            required: true
        },

        // Every month covered by this transaction (one or many),
        // e.g. ["November", "January"]. Old records simply have [].
        months: {
            type: [String],
            default: []
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
        },

        additionalFees: {

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

            // NEW: One Year Exam Fee
            oneYearExamFee: {
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

            // NEW: Tie + Belt ab ek hi balance me
            tieBeltBalance: {
                type: Number,
                default: 0
            },

            // NEW: I-Card Fee
            idCardFee: {
                type: Number,
                default: 0
            },

            shirtPantBalance: {
                type: Number,
                default: 0
            },

            // LEGACY: purane records me tie aur belt alag-alag save the.
            // Inhe hataya nahi gaya taaki purana data aur purani dues
            // bilkul sahi rahein. Naye / edit kiye records me ye 0 rehte
            // hain (value tieBeltBalance me chali jaati hai).
            tieBalance: {
                type: Number,
                default: 0
            },

            beltBalance: {
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