const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");
const Payment = require("./models/Payment");
const Attendance = require("./models/Attendance");
const ExtraClass = require("./models/ExtraClass");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// MongoDB Connection
mongoose
    .connect("mongodb+srv://pratapruhela1922_db_user:R8vy2dha648HorQB@sunshine.vgcvyy8.mongodb.net/?appName=sunshine")
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });


  // ===============================
// ADD STUDENT
// ===============================

app.post("/api/students", async (req, res) => {

    try {

        const data = req.body;

        if (
            !data.studentName ||
            !data.admissionNumber
        ) {

            return res.status(400).json({
                message:
                    "Student name and admission number are required."
            });

        }


        // ==========================================
        // CHECK DUPLICATE ADMISSION NUMBER
        // ==========================================

        const existingStudent =
            await Student.findOne({
                admissionNumber:
                    data.admissionNumber
            });

        if (existingStudent) {

            return res.status(400).json({
                message:
                    "Admission number already exists."
            });

        }


        // ==========================================
        // GENERATE UNIQUE STUDENT ID
        // ==========================================

        const students = await Student.find(
            {
                studentId: {
                    $regex: /^STD\d+$/
                }
            },
            {
                studentId: 1
            }
        );


        let highestNumber = 0;


        students.forEach(student => {

            const number = parseInt(
                student.studentId.replace("STD", ""),
                10
            );


            if (
                !isNaN(number) &&
                number > highestNumber
            ) {

                highestNumber = number;

            }

        });


        const studentNumber =
            highestNumber + 1;


        const studentId =
            "STD" +
            String(studentNumber).padStart(4, "0");


        // ==========================================
        // CREATE STUDENT
        // ==========================================

        const student = new Student({

            studentId,

            ...data

        });


        await student.save();


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        res.status(201).json({

            success: true,

            message:
                "Student added successfully.",

            student

        });


    } catch (error) {

        console.error(
            "Add student error:",
            error
        );


        // MongoDB duplicate studentId protection
        if (error.code === 11000) {

            return res.status(409).json({

                success: false,

                message:
                    "Student ID already exists. Please submit again."

            });

        }


        res.status(500).json({

            success: false,

            message:
                "Server error."

        });

    }

});


// ==========================================
// SAVE / UPDATE ATTENDANCE
// ==========================================

app.post("/api/attendance", async (req, res) => {

    try {

        const {
            date,
            className,
            session,
            students
        } = req.body;


        if (
            !date ||
            !className ||
            !students ||
            !Array.isArray(students)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Date, class and student attendance are required."
            });

        }


        // Date ko day ke start par normalize karo
        const attendanceDate =
            new Date(date);

        attendanceDate.setHours(
            0, 0, 0, 0
        );


        // Same class + same date already exists?
        const existingAttendance =
            await Attendance.findOne({
                date: attendanceDate,
                className: className
            });


        if (existingAttendance) {

            // Existing attendance update
            existingAttendance.students =
                students;

            existingAttendance.session =
                session || "";

            await existingAttendance.save();


            return res.status(200).json({

                success: true,

                message:
                    "Attendance updated successfully.",

                attendance:
                    existingAttendance

            });

        }


        // New attendance create
        const attendance =
            await Attendance.create({

                date: attendanceDate,

                className,

                session:
                    session || "",

                students

            });


        res.status(201).json({

            success: true,

            message:
                "Attendance saved successfully.",

            attendance

        });


    } catch (error) {

        console.error(
            "Save attendance error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to save attendance."

        });

    }

});



// ==========================================
// GET ATTENDANCE BY CLASS AND DATE
// ==========================================

app.get(
    "/api/attendance/:className/:date",
    async (req, res) => {

        try {

            const {
                className,
                date
            } = req.params;


            const attendanceDate =
                new Date(date);

            attendanceDate.setHours(
                0,
                0,
                0,
                0
            );


            const attendance =
                await Attendance.findOne({

                    className,

                    date: attendanceDate

                });


            if (!attendance) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Attendance not found."

                });

            }


            res.status(200).json({

                success: true,

                attendance

            });


        } catch (error) {

            console.error(
                "Fetch attendance error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to fetch attendance."

            });

        }

    }
);



// ==========================================
// GET ALL TEACHERS
// ==========================================

app.get("/api/teachers", async (req, res) => {

    try {

        const teachers = await Teacher
            .find({ status: "active" })
            .select("-password")
            .sort({ createdAt: -1 });


        res.status(200).json({

            success: true,

            count: teachers.length,

            teachers

        });


    } catch (error) {

        console.error(
            "Fetch teachers error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Unable to fetch teachers."

        });

    }

});


// ==========================================
// GET SINGLE TEACHER
// ==========================================

app.get("/api/teachers/:id", async (req, res) => {

    try {

        const teacher = await Teacher
            .findById(req.params.id)
            .select("-password");


        if (!teacher) {

            return res.status(404).json({

                success: false,

                message: "Teacher not found."

            });

        }


        res.status(200).json({

            success: true,

            teacher

        });


    } catch (error) {

        console.error(
            "Fetch teacher error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Unable to fetch teacher."

        });

    }

});

// ==========================================
// GET SINGLE TEACHER
// ==========================================

app.get("/api/teachers/:id", async (req, res) => {

    try {

        const teacher = await Teacher
            .findById(req.params.id)
            .select("-password");


        if (!teacher) {

            return res.status(404).json({

                success: false,

                message: "Teacher not found."

            });

        }


        res.status(200).json({

            success: true,

            teacher

        });


    } catch (error) {

        console.error(
            "Fetch teacher error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Unable to fetch teacher."

        });

    }

});


app.post("/api/payments", async (req, res) => {
    try {

        const {
            studentMongoId,
            monthlyFee,
            amount,
            month,
            paymentDate,
            paymentMode,
            transactionId,

            // Extra Fees
            registrationFee,
            conveyanceFee,
            bookFee,
            stationaryFee,
            examFee,
            redCrossFee,
            scoutFee,
            tieBalance,
            beltBalance,
            shirtPantBalance

        } = req.body;


        // ==========================================
        // FIND STUDENT
        // ==========================================

        const student = await Student.findById(studentMongoId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }


        // ==========================================
        // VALIDATE MONTHLY FEE & PAYMENT
        // ==========================================

        const monthlyFeeNumber = Number(monthlyFee) || 0;
        const paidNumber = Number(amount) || 0;

        if (monthlyFeeNumber < 0 || paidNumber < 0) {
            return res.status(400).json({
                success: false,
                message: "Fee and payment cannot be negative."
            });
        }


        // ==========================================
        // EXTRA FEES
        // ==========================================

        const registrationFeeNumber =
            Math.max(Number(registrationFee) || 0, 0);

        const conveyanceFeeNumber =
            Math.max(Number(conveyanceFee) || 0, 0);

        const bookFeeNumber =
            Math.max(Number(bookFee) || 0, 0);

        const stationaryFeeNumber =
            Math.max(Number(stationaryFee) || 0, 0);

        const examFeeNumber =
            Math.max(Number(examFee) || 0, 0);

        const redCrossFeeNumber =
            Math.max(Number(redCrossFee) || 0, 0);

        const scoutFeeNumber =
            Math.max(Number(scoutFee) || 0, 0);

        const tieBalanceNumber =
            Math.max(Number(tieBalance) || 0, 0);

        const beltBalanceNumber =
            Math.max(Number(beltBalance) || 0, 0);

        const shirtPantBalanceNumber =
            Math.max(Number(shirtPantBalance) || 0, 0);


        // ==========================================
        // FIND PREVIOUS PAYMENTS
        // ==========================================

        const previousPayments = await Payment.find({
            studentId: student.studentId
        }).sort({
            paymentDate: 1,
            createdAt: 1
        });


        // ==========================================
        // CALCULATE PREVIOUS OUTSTANDING DUE
        // ==========================================

        let previousDue = 0;

        previousPayments.forEach(payment => {

            const fee =
                Number(payment.monthlyFee) || 0;

            const paid =
                Number(payment.amount) || 0;

            previousDue += fee - paid;

            // Never allow negative due
            if (previousDue < 0) {
                previousDue = 0;
            }
        });


        // ==========================================
        // CURRENT PAYMENT
        // ==========================================

        // Current payment first clears previous due.

        const amountUsedForPreviousDue =
            Math.min(
                paidNumber,
                previousDue
            );

        const remainingPayment =
            paidNumber -
            amountUsedForPreviousDue;


        // ==========================================
        // CURRENT MONTH DUE
        // ==========================================

        const currentMonthDue =
            Math.max(
                monthlyFeeNumber -
                remainingPayment,
                0
            );


        // ==========================================
        // TOTAL OUTSTANDING DUE
        // ==========================================

        const totalDueAfterPayment =
            Math.max(
                previousDue +
                monthlyFeeNumber -
                paidNumber,
                0
            );


        // ==========================================
        // CREATE PAYMENT
        // ==========================================

        const payment = await Payment.create({

            // --------------------------------------
            // STUDENT DETAILS
            // --------------------------------------

            studentId:
                student.studentId,

            studentName:
                student.studentName,

            fatherName:
                student.fatherName ||
                student.father?.name ||
                "",

            rollNumber:
                student.rollNumber ||
                "",

            className:
                student.academic?.class ||
                "",

            admissionNumber:
                student.admissionNumber ||
                "",


            // --------------------------------------
            // MONTHLY FEE
            // --------------------------------------

            monthlyFee:
                monthlyFeeNumber,

            amount:
                paidNumber,

            dueAmount:
                totalDueAfterPayment,

            month:
                month,

            paymentDate:
                paymentDate
                    ? new Date(paymentDate)
                    : new Date(),

            paymentMode:
                paymentMode || "Cash",

            transactionId:
                transactionId || "",


            // --------------------------------------
            // ADDITIONAL FEES
            // --------------------------------------

            additionalFees: {

                registrationFee:
                    registrationFeeNumber,

                conveyanceFee:
                    conveyanceFeeNumber,

                bookFee:
                    bookFeeNumber,

                stationaryFee:
                    stationaryFeeNumber,

                examFee:
                    examFeeNumber,

                redCrossFee:
                    redCrossFeeNumber,

                scoutFee:
                    scoutFeeNumber,

                tieBalance:
                    tieBalanceNumber,

                beltBalance:
                    beltBalanceNumber,

                shirtPantBalance:
                    shirtPantBalanceNumber
            }
        });


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(201).json({

            success: true,

            message:
                "Fee payment submitted successfully.",

            payment,

            previousDue,

            amountUsedForPreviousDue,

            remainingPayment,

            currentMonthDue,

            totalDue:
                totalDueAfterPayment
        });


    } catch (error) {

        console.error(
            "Payment submit error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to submit payment.",
            
            error:
                error.message
        });
    }
});

app.get("/api/extra-classes", async (req, res) => {
    try {
        const classes = await ExtraClass.find()
            .sort({ className: 1 });
 
        res.json({
            success: true,
            classes
        });
 
    } catch (error) {
        console.error("Fetch extra classes error:", error);
 
        res.status(500).json({
            success: false,
            message: "Unable to fetch classes."
        });
    }
});
 
 
// ==========================================
// CREATE EXTRA CLASS
// ==========================================
 
app.post("/api/extra-classes", async (req, res) => {
    try {
        const { className, academicYear, description } = req.body;
 
        if (!className || !className.trim()) {
            return res.status(400).json({
                success: false,
                message: "Class name is required."
            });
        }
 
        const existingClass = await ExtraClass.findOne({
            className: className.trim()
        });
 
        if (existingClass) {
            return res.status(400).json({
                success: false,
                message: "This class already exists."
            });
        }
 
        const newClass = await ExtraClass.create({
            className: className.trim(),
            academicYear: (academicYear || "").trim(),
            description: (description || "").trim(),
            students: []
        });
 
        res.status(201).json({
            success: true,
            message: "Class created successfully.",
            class: newClass
        });
 
    } catch (error) {
        console.error("Create extra class error:", error);
 
        res.status(500).json({
            success: false,
            message: "Unable to create class."
        });
    }
});
 
 
// ==========================================
// GET SINGLE CLASS (with its students)
// ==========================================
 
app.get("/api/extra-classes/:id", async (req, res) => {
    try {
        const extraClass = await ExtraClass.findById(req.params.id);
 
        if (!extraClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found."
            });
        }
 
        res.json({
            success: true,
            class: extraClass
        });
 
    } catch (error) {
        console.error("Get extra class error:", error);
 
        res.status(500).json({
            success: false,
            message: "Unable to fetch class."
        });
    }
});
 
 
// ==========================================
// UPDATE CLASS
// ==========================================
 
app.put("/api/extra-classes/:id", async (req, res) => {
    try {
        const { className, academicYear, description } = req.body;
 
        const extraClass = await ExtraClass.findById(req.params.id);
 
        if (!extraClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found."
            });
        }
 
        if (className && className.trim()) {
            extraClass.className = className.trim();
        }
 
        if (academicYear !== undefined) {
            extraClass.academicYear = academicYear;
        }
 
        if (description !== undefined) {
            extraClass.description = description;
        }
 
        await extraClass.save();
 
        res.json({
            success: true,
            message: "Class updated successfully.",
            class: extraClass
        });
 
    } catch (error) {
        console.error("Update extra class error:", error);
 
        res.status(500).json({
            success: false,
            message: "Unable to update class."
        });
    }
});
 
 
// ==========================================
// DELETE CLASS
// ==========================================
 
app.delete("/api/extra-classes/:id", async (req, res) => {
    try {
        const extraClass = await ExtraClass.findByIdAndDelete(req.params.id);
 
        if (!extraClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found."
            });
        }
 
        res.json({
            success: true,
            message: "Class deleted successfully."
        });
 
    } catch (error) {
        console.error("Delete extra class error:", error);
 
        res.status(500).json({
            success: false,
            message: "Unable to delete class."
        });
    }
});
 
 
// ==========================================
// helper: build a student object from req.body
// (keeps the ADD and UPDATE routes in sync so no
// field, including penNumber/aadharNumber/email,
// is ever silently dropped)
// ==========================================
 
function buildStudentPayload(body) {
    return {
        name: body.name || "",
        fatherName: body.fatherName || "",
        motherName: body.motherName || "",
        phone: body.phone || "",
        alternatePhone: body.alternatePhone || "",
 
        rollNumber: body.rollNumber || "",
        admissionNumber: body.admissionNumber || "",
 
        penNumber: body.penNumber || "",
        aadharNumber: body.aadharNumber || "",
        email: (body.email || "").trim().toLowerCase(),
 
        dob: body.dob || "",
        gender: body.gender || "",
        address: body.address || "",
 
        monthlyFee: Number(body.monthlyFee) || 0,
        registrationFee: Number(body.registrationFee) || 0,
        conveyanceFee: Number(body.conveyanceFee) || 0,
        bookFee: Number(body.bookFee) || 0,
        stationaryFee: Number(body.stationaryFee) || 0,
        examFee: Number(body.examFee) || 0,
 
        unitTest1: Number(body.unitTest1) || 0,
        unitTest2: Number(body.unitTest2) || 0,
        halfYearly: Number(body.halfYearly) || 0,
        annualExam: Number(body.annualExam) || 0,
        totalMarks: Number(body.totalMarks) || 0,
        percentage: Number(body.percentage) || 0,
        result: body.result || "",
        grade: body.grade || "",
        remarks: body.remarks || "",
 
        attendance: Number(body.attendance) || 0,
        scholarship: body.scholarship || "",
        transport: body.transport || ""
    };
}
 
 
// ==========================================
// ADD STUDENT TO CLASS
// ==========================================
 
app.post("/api/extra-classes/:classId/students", async (req, res) => {
    try {
        const extraClass = await ExtraClass.findById(req.params.classId);
 
        if (!extraClass) {
            return res.status(404).json({
                success: false,
                message: "Extra class not found."
            });
        }
 
        const studentData = buildStudentPayload(req.body);
 
        if (!studentData.name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Student name is required."
            });
        }
 
        // Basic Aadhar sanity check (optional field, 12 digits if provided)
        if (
            studentData.aadharNumber &&
            !/^\d{12}$/.test(studentData.aadharNumber)
        ) {
            return res.status(400).json({
                success: false,
                message: "Aadhar number must be exactly 12 digits."
            });
        }
 
        extraClass.students.push(studentData);
 
        await extraClass.save();
 
        const addedStudent =
            extraClass.students[extraClass.students.length - 1];
 
        res.status(201).json({
            success: true,
            message: "Student added successfully.",
            student: addedStudent,
            class: extraClass
        });
 
    } catch (error) {
        console.error("Add student error:", error);
 
        res.status(500).json({
            success: false,
            message: "Unable to add student."
        });
    }
});
 
 
// ==========================================
// UPDATE STUDENT
// ==========================================
 
app.put("/api/extra-classes/:classId/students/:studentId", async (req, res) => {
    try {
        const extraClass = await ExtraClass.findById(req.params.classId);
 
        if (!extraClass) {
            return res.status(404).json({
                success: false,
                message: "Extra class not found."
            });
        }
 
        const student = extraClass.students.id(req.params.studentId);
 
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }
 
        const studentData = buildStudentPayload(req.body);
 
        if (
            studentData.aadharNumber &&
            !/^\d{12}$/.test(studentData.aadharNumber)
        ) {
            return res.status(400).json({
                success: false,
                message: "Aadhar number must be exactly 12 digits."
            });
        }
 
        Object.assign(student, studentData);
 
        await extraClass.save();
 
        res.json({
            success: true,
            message: "Student updated successfully.",
            student
        });
 
    } catch (error) {
        console.error("Update student error:", error);
 
        res.status(500).json({
            success: false,
            message: "Unable to update student."
        });
    }
});
 
 
// ==========================================
// DELETE STUDENT
// ==========================================
 
app.delete("/api/extra-classes/:classId/students/:studentId", async (req, res) => {
    try {
        const extraClass = await ExtraClass.findById(req.params.classId);
 
        if (!extraClass) {
            return res.status(404).json({
                success: false,
                message: "Extra class not found."
            });
        }
 
        const student = extraClass.students.id(req.params.studentId);
 
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }
 
        student.deleteOne();
 
        await extraClass.save();
 
        res.json({
            success: true,
            message: "Student deleted successfully."
        });
 
    } catch (error) {
        console.error("Delete student error:", error);
 
        res.status(500).json({
            success: false,
            message: "Unable to delete student."
        });
    }
});


app.get("/api/payments/student/:studentId", async (req, res) => {

    try {

        const payments = await Payment
            .find({
                studentId: req.params.studentId
            })
            .sort({
                paymentDate: 1,
                createdAt: 1
            })
            .lean();

        // Make sure additionalFees are included
        const formattedPayments = payments.map(payment => ({
            ...payment,

            additionalFees: {
                registrationFee:
                    Number(payment.additionalFees?.registrationFee) || 0,

                conveyanceFee:
                    Number(payment.additionalFees?.conveyanceFee) || 0,

                bookFee:
                    Number(payment.additionalFees?.bookFee) || 0,

                stationaryFee:
                    Number(payment.additionalFees?.stationaryFee) || 0,

                examFee:
                    Number(payment.additionalFees?.examFee) || 0,

                redCrossFee:
                    Number(payment.additionalFees?.redCrossFee) || 0,

                scoutFee:
                    Number(payment.additionalFees?.scoutFee) || 0,

                tieBalance:
                    Number(payment.additionalFees?.tieBalance) || 0,

                beltBalance:
                    Number(payment.additionalFees?.beltBalance) || 0,

                shirtPantBalance:
                    Number(payment.additionalFees?.shirtPantBalance) || 0
            }
        }));

        res.json({
            success: true,
            payments: formattedPayments
        });

    } catch (error) {

        console.error(
            "Fetch payments error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch payments."
        });

    }

});

// ==========================================
// GET ALL TEACHERS
// ==========================================

app.get("/api/teachers", async (req, res) => {

    try {

        const teachers = await Teacher
            .find({ status: "active" })
            .select("-password")
            .sort({ createdAt: -1 });


        res.status(200).json({

            success: true,

            count: teachers.length,

            teachers

        });


    } catch (error) {

        console.error(
            "Fetch teachers error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Unable to fetch teachers."

        });

    }

});


// ==========================================
// GET SINGLE TEACHER
// ==========================================

app.get("/api/teachers/:id", async (req, res) => {

    try {

        const teacher = await Teacher
            .findById(req.params.id)
            .select("-password");


        if (!teacher) {

            return res.status(404).json({

                success: false,

                message: "Teacher not found."

            });

        }


        res.status(200).json({

            success: true,

            teacher

        });


    } catch (error) {

        console.error(
            "Fetch teacher error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Unable to fetch teacher."

        });

    }

});


// ==========================================
// GET ALL STUDENTS
// ==========================================

app.get("/api/students", async (req, res) => {

    try {

        const students = await Student
            .find()
            .sort({ createdAt: -1 });


        res.status(200).json({

            success: true,

            count: students.length,

            students: students

        });

    } catch (error) {

        console.error("Fetch students error:", error);

        res.status(500).json({

            success: false,

            message: "Unable to fetch students."

        });

    }

});


// ==========================================
// UPDATE COMPLETE STUDENT
// ==========================================

app.put("/api/students/:id", async (req, res) => {

    try {

        const studentId = req.params.id;

        const updatedData = req.body;


        // Check student exists
        const student = await Student.findById(studentId);

        if (!student) {

            return res.status(404).json({
                success: false,
                message: "Student not found."
            });

        }


        // Prevent changing MongoDB _id
        delete updatedData._id;
        delete updatedData.studentId;
        delete updatedData.createdAt;
        delete updatedData.updatedAt;


        // Check admission number duplication
        if (updatedData.admissionNumber) {

            const existingStudent =
                await Student.findOne({
                    admissionNumber:
                        updatedData.admissionNumber,
                    _id: {
                        $ne: studentId
                    }
                });


            if (existingStudent) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Admission number already belongs to another student."
                });

            }

        }


        const updatedStudent =
    await Student.findByIdAndUpdate(
        studentId,
        updatedData,
        {
            returnDocument: "after",
            runValidators: true
        }
    );


        res.status(200).json({

            success: true,

            message:
                "Student details updated successfully.",

            student: updatedStudent

        });


    } catch (error) {

        console.error(
            "Update student error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to update student."

        });

    }

});
// ==========================================
// GET STUDENTS BY CLASS
// ==========================================

app.get("/api/students/class/:className", async (req, res) => {

    try {

        const className = req.params.className;

        const students = await Student
            .find({
                "academic.class": className
            })
            .sort({
                "academic.section": 1,
                rollNumber: 1
            });


        res.status(200).json({

            success: true,

            class: className,

            count: students.length,

            students: students

        });

    } catch (error) {

        console.error("Fetch class students error:", error);

        res.status(500).json({

            success: false,

            message: "Unable to fetch students."

        });

    }

});


// ==========================================
// GET SINGLE STUDENT
// ==========================================

app.get("/api/students/:id", async (req, res) => {

    try {

        const student = await Student.findById(
            req.params.id
        );


        if (!student) {

            return res.status(404).json({

                success: false,

                message: "Student not found."

            });

        }


        res.status(200).json({

            success: true,

            student: student

        });

    } catch (error) {

        console.error("Fetch student error:", error);

        res.status(500).json({

            success: false,

            message: "Unable to fetch student."

        });

    }

});


// ===============================
// TEACHER LOGIN
// ===============================

app.post("/api/teachers/login", async (req, res) => {

    try {

        const { password } = req.body;

        if (!password) {

            return res.status(400).json({
                message: "Password is required."
            });

        }


        // Saare active teachers find karo
        const teachers = await Teacher.find({
            status: "active"
        });


        let loggedInTeacher = null;


        // Password ko bcrypt se verify karo
        for (const teacher of teachers) {

            const isMatch = await bcrypt.compare(
                password,
                teacher.password
            );


            if (isMatch) {

                loggedInTeacher = teacher;
                break;
            }
        }


        if (!loggedInTeacher) {

            return res.status(401).json({
                message: "Invalid teacher password."
            });

        }


        // Password frontend ko kabhi mat bhejna
        const teacherData = {
            teacherId: loggedInTeacher.teacherId,
            employeeId: loggedInTeacher.employeeId,
            name: loggedInTeacher.name,
            email: loggedInTeacher.email,
            phone: loggedInTeacher.phone,
            role: loggedInTeacher.role,
            gender: loggedInTeacher.gender,
            qualification: loggedInTeacher.qualification,
            joiningDate: loggedInTeacher.joiningDate,
            status: loggedInTeacher.status,
            assignedClasses: loggedInTeacher.assignedClasses,
            permissions: loggedInTeacher.permissions,
            profile: loggedInTeacher.profile
        };


        res.status(200).json({

            success: true,

            message: "Teacher login successful.",

            teacher: teacherData

        });


    } catch (error) {

        console.error("Teacher login error:", error);

        res.status(500).json({
            message: "Server error."
        });

    }

});


// Add Teacher
app.post("/api/teachers", async (req, res) => {

    try {

        const {
            name,
            employeeId,
            email,
            phone,
            password,
            gender,
            qualification,
            joiningDate,
            assignedClasses,
            profile
        } = req.body;


        // Required fields
        if (!name || !employeeId || !email || !phone || !password) {

            return res.status(400).json({
                message: "Please fill all required fields."
            });

        }


        // Check duplicate email
        const existingTeacher = await Teacher.findOne({
            email: email.toLowerCase()
        });

        if (existingTeacher) {

            return res.status(400).json({
                message: "Teacher with this email already exists."
            });

        }


        // Check duplicate employee ID
        const existingEmployee = await Teacher.findOne({
            employeeId
        });

        if (existingEmployee) {

            return res.status(400).json({
                message: "Employee ID already exists."
            });

        }


        // Generate Teacher ID
        const lastTeacher = await Teacher
            .findOne()
            .sort({ createdAt: -1 });


        let teacherNumber = 1;

        if (lastTeacher && lastTeacher.teacherId) {

            const number = parseInt(
                lastTeacher.teacherId.replace("TCH", "")
            );

            if (!isNaN(number)) {
                teacherNumber = number + 1;
            }
        }


        const teacherId =
            "TCH" + String(teacherNumber).padStart(3, "0");


        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create teacher
        const teacher = new Teacher({

            teacherId,

            employeeId,

            name,

            email: email.toLowerCase(),

            phone,

            password: hashedPassword,

            role: "teacher",

            gender,

            qualification,

            joiningDate,

            assignedClasses,

            permissions: {
                viewStudents: true,
                markAttendance: true,
                viewAttendance: true,
                enterMarks: true,
                editMarks: true,
                viewResults: true,
                viewFees: false,
                manageFees: false,
                generateAdmitCard: false
            },

            profile

        });


        await teacher.save();


        res.status(201).json({

            success: true,

            message: "Teacher added successfully.",

            teacher: {
                teacherId: teacher.teacherId,
                employeeId: teacher.employeeId,
                name: teacher.name,
                email: teacher.email,
                role: teacher.role,
                assignedClasses: teacher.assignedClasses
            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });

    }

});


// Test route
app.get("/", (req, res) => {

    res.send("School Management Server is running.");

});


// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});