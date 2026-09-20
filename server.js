const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");
const Payment = require("./models/Payment");
const Attendance = require("./models/Attendance");
const ExtraClass = require("./models/ExtraClass");
const ExamMarks = require("./models/ExamMarks");
const AdmitCard = require("./models/AdmitCard");
const Notice = require("./models/Notice");
const TimeTable = require("./models/TimeTable");
const TeacherAttendance = require("./models/TeacherAttendance");
const Class = require("./models/Class");
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
// UPDATE TEACHER
// ==========================================

app.put("/api/teachers/:id", async (req, res) => {

    try {

        const teacherId = req.params.id;

        const {
            employeeId,
            name,
            fatherName,
            department,
            motherName,
            email,
            phone,
            gender,
            qualification,
            joiningDate,
            role,
            status,
            assignedClasses,
            permissions,
            profile
        } = req.body;


        // ==========================================
        // FIND TEACHER
        // ==========================================

        const teacher =
            await Teacher.findById(teacherId);


        if (!teacher) {

            return res.status(404).json({

                success: false,

                message:
                    "Teacher not found."

            });

        }


        // ==========================================
        // CHECK DUPLICATE EMAIL
        // ==========================================

        if (
            email &&
            email.toLowerCase() !==
            teacher.email.toLowerCase()
        ) {

            const existingEmail =
                await Teacher.findOne({

                    email:
                        email.toLowerCase(),

                    _id: {
                        $ne:
                            teacherId
                    }

                });


            if (existingEmail) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Another teacher with this email already exists."

                });

            }

        }


        // ==========================================
        // CHECK DUPLICATE EMPLOYEE ID
        // ==========================================

        if (
            employeeId &&
            employeeId !==
            teacher.employeeId
        ) {

            const existingEmployee =
                await Teacher.findOne({

                    employeeId:
                        employeeId,

                    _id: {
                        $ne:
                            teacherId
                    }

                });


            if (existingEmployee) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Another teacher with this Employee ID already exists."

                });

            }

        }


        // ==========================================
        // UPDATE BASIC INFORMATION
        // ==========================================

        if (employeeId !== undefined)
            teacher.employeeId =
                employeeId;


        if (name !== undefined)
            teacher.name =
                name;


        // NEW
        if (fatherName !== undefined)
            teacher.fatherName =
                fatherName;
        


        // NEW
        if (department !== undefined)
            teacher.department =
                department;


        // NEW
        if (motherName !== undefined)
            teacher.motherName =
                motherName;


        if (email !== undefined)
            teacher.email =
                email.toLowerCase();


        if (phone !== undefined)
            teacher.phone =
                phone;


        if (gender !== undefined)
            teacher.gender =
                gender;


        if (qualification !== undefined)
            teacher.qualification =
                qualification;


        if (joiningDate !== undefined)
            teacher.joiningDate =
                joiningDate;


        if (role !== undefined)
            teacher.role =
                role;


        if (status !== undefined)
            teacher.status =
                status;


        // ==========================================
        // ASSIGNED CLASSES
        // ==========================================

        if (
            assignedClasses !== undefined
        ) {

            teacher.assignedClasses =
                assignedClasses;

        }


        // ==========================================
        // PERMISSIONS
        // ==========================================

        if (
            permissions &&
            typeof permissions === "object"
        ) {

            teacher.permissions =
                permissions;

        }


        // ==========================================
        // PROFILE
        // ==========================================

        if (
            profile &&
            typeof profile === "object"
        ) {

            teacher.profile =
                profile;

        }


        // ==========================================
        // SAVE
        // ==========================================

        await teacher.save();


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({

            success: true,

            message:
                "Teacher details updated successfully.",

            teacher: {

                teacherId:
                    teacher.teacherId,

                employeeId:
                    teacher.employeeId,

                name:
                    teacher.name,

                fatherName:
                    teacher.fatherName,
                department:
                    teacher.department,

                motherName:
                    teacher.motherName,

                email:
                    teacher.email,

                phone:
                    teacher.phone,

                gender:
                    teacher.gender,

                qualification:
                    teacher.qualification,

                joiningDate:
                    teacher.joiningDate,

                role:
                    teacher.role,

                status:
                    teacher.status,

                assignedClasses:
                    teacher.assignedClasses,

                permissions:
                    teacher.permissions,

                profile:
                    teacher.profile

            }

        });


    } catch (error) {

        console.error(
            "Update teacher error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to update teacher.",

            error:
                error.message

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
    additionalFees = {}
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
    Math.max(Number(additionalFees.registrationFee) || 0, 0);

const conveyanceFeeNumber =
    Math.max(Number(additionalFees.conveyanceFee) || 0, 0);

const bookFeeNumber =
    Math.max(Number(additionalFees.bookFee) || 0, 0);

const stationaryFeeNumber =
    Math.max(Number(additionalFees.stationaryFee) || 0, 0);

const examFeeNumber =
    Math.max(Number(additionalFees.examFee) || 0, 0);

const redCrossFeeNumber =
    Math.max(Number(additionalFees.redCrossFee) || 0, 0);

const scoutFeeNumber =
    Math.max(Number(additionalFees.scoutFee) || 0, 0);

const tieBalanceNumber =
    Math.max(Number(additionalFees.tieBalance) || 0, 0);

const beltBalanceNumber =
    Math.max(Number(additionalFees.beltBalance) || 0, 0);

const shirtPantBalanceNumber =
    Math.max(Number(additionalFees.shirtPantBalance) || 0, 0);

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

        const teacher = await Teacher.findById(req.params.id);

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

        console.error("Fetch teacher error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch teacher."
        });
    }
});

// ==========================================
// RESET TEACHER PASSWORD
// (Admin sets a new password. We NEVER read
// back or display the old password — bcrypt
// hashes cannot be reversed to plaintext.)
// ==========================================

app.put("/api/teachers/:id/reset-password", async (req, res) => {

    try {

        const { newPassword } = req.body;

        if (!newPassword || newPassword.trim().length < 6) {

            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters."
            });

        }

        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {

            return res.status(404).json({
                success: false,
                message: "Teacher not found."
            });

        }

        const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

        teacher.password = hashedPassword;

        await teacher.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully."
        });

    } catch (error) {

        console.error("Reset teacher password error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to reset password."
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
        const className = decodeURIComponent(req.params.className).trim();

        if (!className) {
            return res.status(400).json({
                success: false,
                message: "Class name is required."
            });
        }

        const students = await Student.find({
            "academic.class": className
        }).sort({
            studentName: 1
        });

        console.log(
            `CLASS: "${className}" | STUDENTS: ${students.length}`
        );

        res.json({
            success: true,
            className,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("GET CLASS STUDENTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch class students."
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
    fatherName: loggedInTeacher.fatherName,
    department: loggedInTeacher.department,
    motherName: loggedInTeacher.motherName,
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

// ==========================================
// SAVE / UPDATE EXAM MARKS
// MAIN STUDENT COLLECTION
// ==========================================

app.post("/api/exam-marks", async (req, res) => {

    try {

        const {
            exam,
            className,
            studentMongoId,
            marks
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !exam ||
            !className ||
            !studentMongoId
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Exam, class and student are required."
            });

        }


        // ==========================================
        // FIND STUDENT FROM MAIN STUDENT COLLECTION
        // ==========================================

        const student =
            await Student.findById(studentMongoId);


        if (!student) {

            return res.status(404).json({
                success: false,
                message:
                    "Student not found."
            });

        }


        // ==========================================
        // VERIFY STUDENT BELONGS TO SELECTED CLASS
        // ==========================================

        if (
            String(student.academic?.class || "")
                .trim() !== String(className).trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Student does not belong to this class."
            });

        }


        // ==========================================
        // MARKS ARRAY
        // ==========================================

        const marksArray =
            Array.isArray(marks)
                ? marks
                : [];


        // ==========================================
        // CALCULATE TOTALS
        // ==========================================

        let totalMaxMarks = 0;
        let totalObtainedMarks = 0;


        const formattedMarks =
    marksArray.map(item => {

        const maxMarks =
            Math.max(
                Number(item.maxMarks) || 0,
                0
            );

        const status =
            String(item.status || "PRESENT")
                .toUpperCase() === "ABSENT"
                ? "ABSENT"
                : "PRESENT";

        const obtainedMarks =
            status === "ABSENT"
                ? 0
                : Math.max(
                    Number(item.obtainedMarks) || 0,
                    0
                );


        totalMaxMarks += maxMarks;

        // ABSENT student ke 0 marks total me add honge,
        // lekin obtained marks 0 hi rahenge.
        totalObtainedMarks += Math.min(
            obtainedMarks,
            maxMarks
        );


        return {

            subjectName:
                item.subjectName || "",

            maxMarks,

            obtainedMarks:
                Math.min(
                    obtainedMarks,
                    maxMarks
                ),

            status

        };

    });


        // ==========================================
        // PERCENTAGE
        // ==========================================

        const percentage =
            totalMaxMarks > 0
                ? Number(
                    (
                        (
                            totalObtainedMarks /
                            totalMaxMarks
                        ) * 100
                    ).toFixed(2)
                )
                : 0;


        // ==========================================
        // RESULT
        // ==========================================

        const result =
            percentage >= 33
                ? "Pass"
                : "Fail";


        // ==========================================
        // FIND EXISTING RECORD
        // ==========================================

        let examMarks =
            await ExamMarks.findOne({

                exam,

                className,

                studentMongoId

            });


        // ==========================================
        // UPDATE EXISTING
        // ==========================================

        if (examMarks) {

            examMarks.marks =
                formattedMarks;

            examMarks.totalMaxMarks =
                totalMaxMarks;

            examMarks.totalObtainedMarks =
                totalObtainedMarks;

            examMarks.percentage =
                percentage;

            examMarks.result =
                result;


            // Student latest information
            examMarks.studentId =
                student.studentId || "";

            examMarks.studentName =
                student.studentName || "";

            examMarks.fatherName =
                student.fatherName || "";

            examMarks.motherName =
                student.motherName || "";

            examMarks.rollNumber =
                student.rollNumber || "";

            examMarks.admissionNumber =
                student.admissionNumber || "";

            examMarks.phone =
                student.phone || "";

            examMarks.penNumber =
                student.penNumber || "";

            examMarks.dob =
                student.dob || "";

            examMarks.address =
                student.address || "";

            examMarks.gender =
                student.gender || "";


            await examMarks.save();


            return res.status(200).json({

                success: true,

                message:
                    "Exam marks updated successfully.",

                examMarks

            });

        }


        // ==========================================
        // CREATE NEW RECORD
        // ==========================================

        examMarks =
            await ExamMarks.create({

                exam,

                className,

                studentMongoId:
                    student._id,

                studentId:
                    student.studentId || "",

                studentName:
                    student.studentName || "",

                fatherName:
                    student.fatherName || "",

                motherName:
                    student.motherName || "",

                rollNumber:
                    student.rollNumber || "",

                admissionNumber:
                    student.admissionNumber || "",

                phone:
                    student.phone || "",

                penNumber:
                    student.penNumber || "",

                dob:
                    student.dob || "",

                address:
                    student.address || "",

                gender:
                    student.gender || "",

                marks:
                    formattedMarks,

                totalMaxMarks,

                totalObtainedMarks,

                percentage,

                result

            });


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(201).json({

            success: true,

            message:
                "Exam marks saved successfully.",

            examMarks

        });


    } catch (error) {

        console.error(
            "Save exam marks error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to save exam marks.",

            error:
                error.message

        });

    }

});

// ==========================================
// GET ALL UNIQUE CLASSES FROM STUDENTS
// ==========================================

app.get("/api/exam/classes", async (req, res) => {

    try {

        const classes =
            await Student.distinct(
                "academic.class"
            );


        const formattedClasses =
            classes
                .filter(
                    className =>
                        className &&
                        String(className).trim()
                )
                .map(
                    className =>
                        String(className).trim()
                )
                .sort(
                    (a, b) =>
                        a.localeCompare(
                            b,
                            undefined,
                            {
                                numeric: true
                            }
                        )
                );


        res.status(200).json({

            success: true,

            classes:
                formattedClasses

        });


    } catch (error) {

        console.error(
            "Fetch exam classes error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to fetch classes."

        });

    }

});

// ==========================================
// GET STUDENTS FOR EXAM BY CLASS
// ==========================================

app.get(
    "/api/exam/classes/:className/students",
    async (req, res) => {

        try {

            const className =
                decodeURIComponent(
                    req.params.className
                );


            const students =
                await Student.find({

                    "academic.class":
                        className

                })
                .sort({

                    "academic.section": 1,

                    rollNumber: 1,

                    studentName: 1

                })
                .lean();


            res.status(200).json({

                success: true,

                class:
                    className,

                count:
                    students.length,

                students

            });


        } catch (error) {

            console.error(
                "Fetch exam class students error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to fetch class students."

            });

        }

    }
);

// ==========================================
// GET EXAM MARKS
// ==========================================

app.get(
    "/api/exam-marks/:exam/:className",
    async (req, res) => {

        try {

            const exam =
                decodeURIComponent(
                    req.params.exam
                );

            const className =
                decodeURIComponent(
                    req.params.className
                );


            const examMarks =
                await ExamMarks.find({

                    exam,

                    className

                })
                .sort({

                    rollNumber: 1,

                    studentName: 1

                })
                .lean();


            res.status(200).json({

                success: true,

                exam,

                className,

                count:
                    examMarks.length,

                examMarks

            });


        } catch (error) {

            console.error(
                "Fetch exam marks error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to fetch exam marks."

            });

        }

    }
);


// ==========================================
// GET ALL EXAM MARKS (every class, every exam)
// Used by result.html to build the class/student
// browser without knowing exam names in advance.
// ==========================================

app.get(
    "/api/exam-marks",
    async (req, res) => {

        try {

            const examMarks =
                await ExamMarks.find({})
                    .sort({
                        className: 1,
                        rollNumber: 1,
                        studentName: 1
                    })
                    .lean();

            res.status(200).json({

                success: true,

                count:
                    examMarks.length,

                examMarks

            });

        } catch (error) {

            console.error(
                "Fetch all exam marks error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to fetch exam marks."

            });

        }

    }
);
// ==========================================
// UPDATE EXAM MARKS BY ID
// ==========================================

app.put("/api/exam-marks/:id", async (req, res) => {

    try {

        const examId = req.params.id;
        const {
            exam,
            className,
            studentMongoId,
            studentId,
            studentName,
            rollNumber,
            admissionNumber,
            fatherName,
            motherName,
            marks,
            division
        } = req.body;

        // ==========================================
        // VALIDATION
        // ==========================================

        if (!examId) {
            return res.status(400).json({
                success: false,
                message: "Exam ID is required."
            });
        }

        // ==========================================
        // FIND EXISTING EXAM MARKS
        // ==========================================

        const examMarks = await ExamMarks.findById(examId);

        if (!examMarks) {
            return res.status(404).json({
                success: false,
                message: "Exam marks not found."
            });
        }

        // ==========================================
        // MARKS ARRAY
        // ==========================================

        const marksArray = Array.isArray(marks) ? marks : [];

        // ==========================================
        // CALCULATE TOTALS
        // ==========================================

        let totalMaxMarks = 0;
        let totalObtainedMarks = 0;

        const formattedMarks = marksArray.map(item => {

    const maxMarks =
        Math.max(
            Number(item.maxMarks) || 0,
            0
        );

    const status =
        String(item.status || "PRESENT")
            .toUpperCase() === "ABSENT"
            ? "ABSENT"
            : "PRESENT";

    const obtainedMarks =
        status === "ABSENT"
            ? 0
            : Math.max(
                Number(item.obtainedMarks) || 0,
                0
            );


    totalMaxMarks += maxMarks;

    totalObtainedMarks += Math.min(
        obtainedMarks,
        maxMarks
    );


    return {

        subjectName:
            item.subjectName || "",

        maxMarks,

        obtainedMarks:
            Math.min(
                obtainedMarks,
                maxMarks
            ),

        status

    };

});

        // ==========================================
        // PERCENTAGE
        // ==========================================

        const percentage = totalMaxMarks > 0
            ? Number(((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2))
            : 0;

        // ==========================================
        // RESULT
        // ==========================================

        const result = percentage >= 33 ? "Pass" : "Fail";

        // ==========================================
        // UPDATE EXAM MARKS
        // ==========================================

        examMarks.exam = exam || examMarks.exam;
        examMarks.className = className || examMarks.className;
        examMarks.studentMongoId = studentMongoId || examMarks.studentMongoId;
        examMarks.studentId = studentId || examMarks.studentId;
        examMarks.studentName = studentName || examMarks.studentName;
        examMarks.rollNumber = rollNumber || examMarks.rollNumber;
        examMarks.admissionNumber = admissionNumber || examMarks.admissionNumber;
        examMarks.fatherName = fatherName || examMarks.fatherName;
        examMarks.motherName = motherName || examMarks.motherName;
        examMarks.marks = formattedMarks;
        examMarks.totalMaxMarks = totalMaxMarks;
        examMarks.totalObtainedMarks = totalObtainedMarks;
        examMarks.percentage = percentage;
        examMarks.result = result;
        examMarks.division = division !== undefined ? division : examMarks.division;   // 👈 ye line add karo

        await examMarks.save();

        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({
            success: true,
            message: "Exam marks updated successfully.",
            examMarks
        });

    } catch (error) {

        console.error("Update exam marks error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update exam marks.",
            error: error.message
        });

    }

});


// Add Teacher
// Add Teacher
app.post("/api/teachers", async (req, res) => {

    try {

        const {
            name,
            fatherName,
            department,
            motherName,
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

            fatherName: fatherName || "",
            department: department || "",
            motherName: motherName || "",

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
                fatherName: teacher.fatherName,
                department: teacher.department,
                motherName: teacher.motherName,
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


app.get("/api/admitcard/download", async (req, res) => {
    try {
        const { exam, className } = req.query;

        if (!exam || !className) {
            return res.status(400).json({
                success: false,
                message: "Exam and class are required"
            });
        }

        const admitCard = await AdmitCard.findOne({
            exam: exam,
            className: className
        });

        if (!admitCard) {
            return res.status(404).json({
                success: false,
                message: "Admit card schedule not found"
            });
        }

        const students = await Student.find({
            "academic.class": className
        }).lean();

        if (!students.length) {
            return res.status(404).json({
                success: false,
                message: "No students found in this class"
            });
        }

        let csv = "";

        csv += [
            "Student Name",
            "Student ID",
            "Admission Number",
            "Roll Number",
            "Father Name",
            "Mother Name",
            "DOB",
            "Gender",
            "Class",
            "Section",
            "Exam",
            "Subject",
            "Exam Date",
            "Exam Day"
        ].join(",") + "\n";

        students.forEach(student => {

            admitCard.subjects.forEach(subject => {

                const row = [
                    student.studentName || "",
                    student.studentId || "",
                    student.admissionNumber || "",
                    student.rollNumber || "",
                    student.father?.name || "",
                    student.mother?.name || "",
                    student.dob
                        ? new Date(student.dob).toLocaleDateString("en-IN")
                        : "",
                    student.gender || "",
                    student.academic?.class || "",
                    student.academic?.section || "",
                    exam,
                    subject.subject || "",
                    subject.date || "",
                    subject.day || ""
                ];

                csv += row
                    .map(value => `"${String(value).replace(/"/g, '""')}"`)
                    .join(",") + "\n";
            });
        });

        res.setHeader(
            "Content-Type",
            "text/csv; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="Admit_Cards_${exam}_${className}.csv"`
        );

        res.send("\uFEFF" + csv);

    } catch (error) {

        console.error("Admit card download error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.post("/api/admitcard", async (req, res) => {
    try {
        const { exam, className, subjects } = req.body;

        if (!exam || !className || !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Exam, class and subjects are required"
            });
        }

        const AdmitCard = require("./models/AdmitCard");

        const admitCard = await AdmitCard.findOneAndUpdate(
            {
                exam: exam,
                className: className
            },
            {
                exam: exam,
                className: className,
                subjects: subjects
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Admit card saved successfully",
            data: admitCard
        });

    } catch (error) {
        console.error("Admit card save error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save admit card",
            error: error.message
        });
    }
});



// ==============================
// NOTICE BOARD
// ==============================

// GET ALL NOTICES
app.get("/api/notices", async (req, res) => {

    try {

        const notices = await Notice
            .find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            notices
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch notices"
        });
    }
});


// ADD NOTICE
app.post("/api/notices", async (req, res) => {

    try {

        const { notice } = req.body;

        if (!notice || !notice.trim()) {

            return res.status(400).json({
                success: false,
                message: "Notice is required"
            });
        }

        const newNotice =
            await Notice.create({
                notice: notice.trim()
            });

        res.status(201).json({
            success: true,
            notice: newNotice
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to add notice"
        });
    }
});


// DELETE NOTICE
app.delete("/api/notices/:id", async (req, res) => {

    try {

        const deleted =
            await Notice.findByIdAndDelete(
                req.params.id
            );

        if (!deleted) {

            return res.status(404).json({
                success: false,
                message: "Notice not found"
            });
        }

        res.json({
            success: true,
            message: "Notice deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete notice"
        });
    }
});


app.post("/api/students/login", async (req, res) => {
    try {
        const { dob } = req.body;

        if (!dob) {
            return res.status(400).json({
                success: false,
                message: "Date of birth is required."
            });
        }

        // Expected format: DD/MM/YYYY
        const parts = dob.trim().split("/");

        if (parts.length !== 3) {
            return res.status(400).json({
                success: false,
                message: "Please enter DOB in DD/MM/YYYY format."
            });
        }

        const day = Number(parts[0]);
        const month = Number(parts[1]);
        const year = Number(parts[2]);

        if (
            !day ||
            !month ||
            !year ||
            day < 1 ||
            day > 31 ||
            month < 1 ||
            month > 12 ||
            year < 1900
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid date of birth."
            });
        }

        /*
         * MongoDB Date can contain time.
         * So don't search using exact Date.
         * Search between start and end of that date.
         */

        const startDate = new Date(
            year,
            month - 1,
            day,
            0,
            0,
            0,
            0
        );

        const endDate = new Date(
            year,
            month - 1,
            day + 1,
            0,
            0,
            0,
            0
        );

        const student = await Student.findOne({
            dob: {
                $gte: startDate,
                $lt: endDate
            }
        }).select("-__v");

        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Invalid date of birth or student not found."
            });
        }

        // Send student data to frontend
        return res.json({
            success: true,
            message: "Student login successful.",
            student: student
        });

    } catch (error) {
        console.error("Student login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during student login."
        });
    }
});

app.get("/api/exam-marks/student/:studentMongoId", async (req, res) => {
    try {
        const examMarks = await ExamMarks.find({
            studentMongoId: req.params.studentMongoId
        }).sort({ createdAt: 1 });

        res.json({
            success: true,
            examMarks
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch student results."
        });
    }
});


app.get("/api/student/exam-marks/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;

        const examMarks = await ExamMarks.find({
            studentId: studentId
        }).sort({
            createdAt: 1
        });

        res.json({
            success: true,
            examMarks
        });

    } catch (error) {
        console.error("Student exam marks error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch exam marks."
        });
    }
});


app.get("/api/student/attendance/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;

        // Student collection se student find karo
        const student = await Student.findOne({
            studentId: studentId
        }).lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        // Attendance collection me MongoDB _id se search karo
        const attendance = await Attendance.find({
            "students.studentId": student._id
        })
        .sort({ date: -1 })
        .lean();

        // Sirf logged-in student ka attendance record nikalo
        const studentAttendance = attendance.map(record => {

            const studentRecord =
                record.students.find(
                    item =>
                        String(item.studentId) ===
                        String(student._id)
                );

            return {
                _id: record._id,
                date: record.date,
                className: record.className,
                session: record.session,
                studentId: studentRecord?.studentId || student._id,
                studentName: studentRecord?.studentName || student.studentName,
                rollNumber: studentRecord?.rollNumber || student.rollNumber,
                status: studentRecord?.status || "Absent"
            };

        });

        res.json({
            success: true,
            attendance: studentAttendance
        });

    } catch (error) {

        console.error(
            "Student attendance error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load student attendance."
        });

    }
});


// ===============================
// TIME TABLE APIs
// ===============================

/* =========================================================
   GET ALL TIMETABLES
========================================================= */
/* =========================================================
   GET ALL TIMETABLES
========================================================= */

app.get("/api/timetable", async (req, res) => {
    try {

        const timetables = await TimeTable
            .find()
            .sort({ season: 1 });

        res.json({
            success: true,
            timetables
        });

    } catch (error) {

        console.error("Fetch timetable error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch timetable."
        });
    }
});


/* =========================================================
   GET TIMETABLE BY SEASON
========================================================= */

app.get("/api/timetable/:season", async (req, res) => {
    try {

        const timetable = await TimeTable.findOne({
            season: req.params.season
        });

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: `${req.params.season} timetable not found.`
            });
        }

        res.json({
            success: true,
            timetable
        });

    } catch (error) {

        console.error("Fetch timetable error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch timetable."
        });
    }
});


/* =========================================================
   NORMALIZE LECTURES
========================================================= */

function normalizeLectures(lectures) {

    if (!Array.isArray(lectures)) {
        return [];
    }

    return lectures.map((lecture, index) => {

        const formatted = {

            type:
                lecture.type === "lunch"
                    ? "lunch"
                    : "lecture",

            lectureNumber:
                lecture.type === "lunch"
                    ? undefined
                    : (
                        Number(lecture.lectureNumber) ||
                        index + 1
                    ),

            from: lecture.from || "",

            to: lecture.to || "",

            classes: {}
        };


        /* =========================================
           LUNCH
        ========================================= */

        if (lecture.type === "lunch") {
            formatted.classes = {};
            return formatted;
        }


        /* =========================================
           CLASSES
        ========================================= */

        if (
            lecture.classes &&
            typeof lecture.classes === "object"
        ) {

            for (
                const [className, classData]
                of Object.entries(lecture.classes)
            ) {

                if (!className) continue;


                /* =====================================
                   NEW FORMAT

                   Class 1: {
                       teacherId,
                       teacherName,
                       subject
                   }
                ===================================== */

                if (
                    classData &&
                    typeof classData === "object" &&
                    !Array.isArray(classData)
                ) {

                    formatted.classes[className] = {

                        teacherId:
                            classData.teacherId || "",

                        teacherName:
                            classData.teacherName || "",

                        subject:
                            classData.subject || ""
                    };

                }


                /* =====================================
                   OLD FORMAT

                   Class 1: "Rahul Sir"

                   Convert old data automatically
                ===================================== */

                else {

                    formatted.classes[className] = {

                        teacherId: "",

                        teacherName:
                            classData || "",

                        subject: ""
                    };
                }
            }
        }

        return formatted;
    });
}


/* =========================================================
   CREATE / SAVE TIMETABLE
========================================================= */

app.post("/api/timetable", async (req, res) => {

    try {

        const {
            season,
            teacherTiming,
            studentTiming,
            prayerBell,
            lectures
        } = req.body;


        /* =========================================
           VALIDATION
        ========================================= */

        if (!season) {

            return res.status(400).json({
                success: false,
                message: "Season is required."
            });
        }


        if (
            lectures !== undefined &&
            !Array.isArray(lectures)
        ) {

            return res.status(400).json({
                success: false,
                message: "Lectures must be an array."
            });
        }


        /* =========================================
           FORMAT LECTURES
        ========================================= */

        const formattedLectures =
            normalizeLectures(lectures);


        /* =========================================
           SAVE / UPSERT
        ========================================= */

        const timetable =
            await TimeTable.findOneAndUpdate(

                {
                    season
                },

                {
                    season,

                    teacherTiming:
                        teacherTiming || "",

                    studentTiming:
                        studentTiming || "",

                    prayerBell:
                        prayerBell || "",

                    lectures:
                        formattedLectures
                },

                {
                    new: true,

                    upsert: true,

                    runValidators: true,

                    setDefaultsOnInsert: true
                }
            );


        res.json({

            success: true,

            message:
                `${season} timetable saved successfully.`,

            timetable
        });


    } catch (error) {

        console.error(
            "Save timetable error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to save timetable.",

            error:
                error.message
        });
    }
});


/* =========================================================
   UPDATE TIMETABLE BY ID
========================================================= */

app.put("/api/timetable/:id", async (req, res) => {

    try {

        const {
            season,
            teacherTiming,
            studentTiming,
            prayerBell,
            lectures
        } = req.body;


        /* =========================================
           VALIDATION
        ========================================= */

        if (!season) {

            return res.status(400).json({

                success: false,

                message:
                    "Season is required."
            });
        }


        if (
            lectures !== undefined &&
            !Array.isArray(lectures)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Lectures must be an array."
            });
        }


        /* =========================================
           FORMAT LECTURES
        ========================================= */

        const formattedLectures =
            normalizeLectures(lectures);


        /* =========================================
           UPDATE
        ========================================= */

        const timetable =
            await TimeTable.findByIdAndUpdate(

                req.params.id,

                {

                    season,

                    teacherTiming:
                        teacherTiming || "",

                    studentTiming:
                        studentTiming || "",

                    prayerBell:
                        prayerBell || "",

                    lectures:
                        formattedLectures
                },

                {
                    new: true,

                    runValidators: true
                }
            );


        if (!timetable) {

            return res.status(404).json({

                success: false,

                message:
                    "Timetable not found."
            });
        }


        res.json({

            success: true,

            message:
                "Timetable updated successfully.",

            timetable
        });


    } catch (error) {

        console.error(
            "Update timetable error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to update timetable.",

            error:
                error.message
        });
    }
});


/* =========================================================
   DELETE TIMETABLE
========================================================= */

app.delete("/api/timetable/:id", async (req, res) => {

    try {

        const timetable =
            await TimeTable.findByIdAndDelete(
                req.params.id
            );


        if (!timetable) {

            return res.status(404).json({

                success: false,

                message:
                    "Timetable not found."
            });
        }


        res.json({

            success: true,

            message:
                "Timetable deleted successfully."
        });


    } catch (error) {

        console.error(
            "Delete timetable error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to delete timetable."
        });
    }
});

// DELETE student by id
// DELETE student by id (Mongo _id)
app.delete("/api/students/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deletedStudent = await Student.findByIdAndDelete(id);

        if (!deletedStudent) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Student deleted successfully.",
            student: deletedStudent
        });
    } catch (error) {
        console.error("Delete student error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to delete student."
        });
    }
});

// ==========================================
// DELETE TEACHER
// ==========================================

app.delete("/api/teachers/:id", async (req, res) => {

    try {

        const teacher = await Teacher.findByIdAndDelete(
            req.params.id
        );


        if (!teacher) {

            return res.status(404).json({

                success: false,

                message: "Teacher not found."

            });

        }


        res.status(200).json({

            success: true,

            message: "Teacher deleted successfully."

        });


    } catch (error) {

        console.error(
            "Delete teacher error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Unable to delete teacher."

        });

    }

});


// DELETE /api/payments/:paymentId
app.delete('/api/payments/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        const deletedPayment = await Payment.findByIdAndDelete(paymentId);

        if (!deletedPayment) {
            return res.status(404).json({ success: false, message: 'Payment record not found.' });
        }

        return res.status(200).json({ success: true, message: 'Payment deleted successfully.' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        return res.status(500).json({ success: false, message: 'Server error while deleting payment.' });
    }
});



function escapeRegex(string) {

  return string.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

}

app.get("/api/classes", async (req, res) => {
    try {
        const classes = await Class.find().sort({ name: 1 });

        res.json({
            success: true,
            classes
        });

    } catch (error) {
        console.error("GET CLASSES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch classes"
        });
    }
});
app.post("/api/classes", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Class name is required"
            });
        }

        const className = name.trim();

        const existingClass = await Class.findOne({
            name: className
        });

        if (existingClass) {
            return res.status(409).json({
                success: false,
                message: `${className} already exists`
            });
        }

        const newClass = await Class.create({
            name: className
        });

        res.status(201).json({
            success: true,
            message: "Class created successfully",
            class: newClass
        });

    } catch (error) {
        console.error("CREATE CLASS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create class"
        });
    }
});


// ================= CLASS-WISE STUDENT COUNTS =================

app.get("/api/class-student-counts", async (req, res) => {
  try {
    const counts = await Student.aggregate([
      {
        $match: {
          status: "active"
        }
      },
      {
        $group: {
          _id: "$academic.class",
          studentCount: { $sum: 1 }
        }
      }
    ]);

    const result = {};

    counts.forEach(item => {
      if (item._id !== null && item._id !== undefined) {
        result[String(item._id).trim()] = item.studentCount;
      }
    });

    res.json({
      success: true,
      counts: result
    });

  } catch (error) {
    console.error("Class student count error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get class student counts"
    });
  }
});



/* =============================================================
   TEACHER ATTENDANCE — ADD THESE TO server.js
   =============================================================

   STEP 1: Top of server.js, saath me baaki model requires ke,
   ye line add kar:

       const TeacherAttendance = require("./models/TeacherAttendance");

   STEP 2: Neeche ke saare routes kahin bhi (student/attendance
   routes ke paas) paste kar de, jaise "app.listen" se upar.
============================================================= */


// ==========================================
// SAVE / UPDATE TEACHER ATTENDANCE (for a date)
// ==========================================

app.post("/api/teacher-attendance", async (req, res) => {

    try {

        const { date, teachers } = req.body;

        if (!date || !teachers || !Array.isArray(teachers)) {

            return res.status(400).json({
                success: false,
                message: "Date and teacher attendance list are required."
            });

        }

        // Date ko day ke start par normalize karo (jaise student attendance me hota hai)
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Har teacher entry basic validate kar lo
        const cleanedTeachers = teachers.map((t) => ({
            teacher: t.teacher,
            teacherId: t.teacherId || "",
            employeeId: t.employeeId || "",
            name: t.name || "",
            department: t.department || "",
            status: t.status || "Present",
            inTime: t.inTime || "",
            outTime: t.outTime || ""
        }));

        const existing = await TeacherAttendance.findOne({
            date: attendanceDate
        });

        if (existing) {

            existing.teachers = cleanedTeachers;
            await existing.save();

            return res.status(200).json({
                success: true,
                message: "Teacher attendance updated successfully.",
                attendance: existing
            });

        }

        const attendance = await TeacherAttendance.create({
            date: attendanceDate,
            teachers: cleanedTeachers
        });

        res.status(201).json({
            success: true,
            message: "Teacher attendance saved successfully.",
            attendance
        });

    } catch (error) {

        console.error("Save teacher attendance error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to save teacher attendance."
        });

    }

});


// ==========================================
// GET TEACHER ATTENDANCE BY DATE
// ==========================================

app.get("/api/teacher-attendance/:date", async (req, res) => {

    try {

        const { date } = req.params;

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const attendance = await TeacherAttendance.findOne({
            date: attendanceDate
        });

        if (!attendance) {

            return res.status(404).json({
                success: false,
                message: "Attendance not found for this date."
            });

        }

        res.status(200).json({
            success: true,
            attendance
        });

    } catch (error) {

        console.error("Fetch teacher attendance error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch teacher attendance."
        });

    }

});


// ==========================================
// (OPTIONAL) GET ALL TEACHER ATTENDANCE RECORDS
// Useful for a history / report page later
// ==========================================

app.get("/api/teacher-attendance", async (req, res) => {

    try {

        const records = await TeacherAttendance
            .find()
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: records.length,
            records
        });

    } catch (error) {

        console.error("Fetch all teacher attendance error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch teacher attendance records."
        });

    }

});


// EDIT CLASS NAME
app.put("/api/classes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Class name is required"
      });
    }

    const newName = name.trim();

    // Find class
    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found"
      });
    }

    const oldName = classData.name;

    // Check duplicate class name
    const existingClass = await Class.findOne({
      name: newName,
      _id: { $ne: id }
    });

    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: "A class with this name already exists"
      });
    }

    // Update class name
    classData.name = newName;

    await classData.save();

    /*
     * IMPORTANT:
     * If students store class name as a string,
     * update those students too.
     *
     * Remove this section if your students reference
     * the class using class ID instead.
     */

    await Student.updateMany(
      { "academic.class": oldName },
      {
        $set: {
          "academic.class": newName
        }
      }
    );

    res.json({
      success: true,
      message: "Class updated successfully",
      oldName,
      newName,
      class: classData
    });

  } catch (error) {
    console.error("Edit class error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update class",
      error: error.message
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