import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import {Resend} from 'resend';
// import * as Brevo from '@getbrevo/brevo';
// import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';

// --- ES MODULES FIX ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

console.log("Key Found:", process.env.BREVO_API_KEY ? "Yes" : "NO");

// const apiInstance = new TransactionalEmailsApi();
// let apiKey = apiInstance.authentications['apiKey'];
// apiKey.apiKey = process.env.BREVO_API_KEY; // The xkeysib- key from Render

// const resend = new Resend(process.env.RESEND_API_KEY);

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER, // Your gmail: suryamamidala22@gmail.com
//     pass: process.env.EMAIL_PASS  // Your 16-digit App Password (no spaces)
//   }
// });
// // const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({
//     pool: true,
//     host: 'smtp.gmail.com',
//     port: 465,         // Changed from 587 to 465
//     secure: true,      // Must be TRUE for port 465
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS 
//     },
//     tls: {
//         rejectUnauthorized: false,
//         addressSelection: 'ipv4first'
//     }
// });
// // --- EMAIL CONFIG ---
const otpstore = {};
// --- MONGODB CONNECTION & SEEDING ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ Connected to Aditya Library DB");
        seedBooks(); // Seed books after successful connection
    })
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- 2. Admin Schema & Model (Defined directly in server.js) ---
const adminSchema = new mongoose.Schema({
    empId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: true }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

// --- 3. Registration Route ---
app.post('/api/admin/register', async (req, res) => {
    try {
        const { empId, name, email, password, adminSecret } = req.body;
        // Verify System Secret (Matches your React form)
        if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ message: "Invalid System Admin Secret" });
        }
        // Check if Admin already exists
        const existingAdmin = await Admin.findOne({ $or: [{ email }, { empId }] });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin with this Email or ID already exists" });
        }
        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create and Save
        const newAdmin = new Admin({
            empId,
            name,
            email,
            password: hashedPassword
        });
        await newAdmin.save();
        res.status(201).json({ message: "Admin Registered Successfully!" });
    } catch (error) {
        console.error("Admin Registration Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// --- LOGIN ROUTE (Add this below your registration route) ---
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. Find admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: "Admin not found" });
        }
        // 2. Compare entered password with hashed password in DB
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // 3. (Optional) Generate a simple response or a JWT token
        res.status(200).json({
            message: "Login successful",
            admin: { _id: admin._id, name: admin.name, email: admin.email },
            token: "sample_token_123" // In production, use jsonwebtoken (jwt)
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// User Schema
const userSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);


// --- API ROUTES ---
app.get('/', (req, res) => {
    res.send("Aditya Library Backend is Running...");
});

// Fetch all books
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find({});
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving catalog" });
    }
});


app.post('/api/register', async (req, res) => {
    const { studentId, name, email, password } = req.body;
    
    // 1. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        // 2. Check if user already exists and is verified
        const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: "User already exists and is verified." });
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Save/Update user with the OTP (unverified state)
        await User.findOneAndUpdate(
            { email },
            { studentId, name, password: hashedPassword, otp, isVerified: false },
            { upsert: true, new: true }
        );

        // 5. Send Email via Fetch (The "No-Fail" method)
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY, // Ensure this is in your .env
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: { name: "Aditya Library Hub", email: "suryamamidala75@gmail.com" },
                to: [{ email: email }],
                subject: "Verify your Aditya Library Account - OTP",
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #2c3e50;">Hello ${name},</h2>
                        <p>Welcome to the Library Hub! Your verification code is below:</p>
                        <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #007bff; border-radius: 5px;">
                            ${otp}
                        </div>
                        <p style="margin-top: 20px; color: #777; font-size: 12px;">This code is valid for 5 minutes.</p>
                    </div>`
            })
        });

        // 6. Check if Brevo accepted the request
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Brevo API Error:", errorData);
            return res.status(500).json({ message: "Failed to send OTP email." });
        }

        res.status(201).json({ message: "OTP sent to your email!" });

    } catch (error) {
        console.error("System Error during registration:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});
// // Register User
// app.post('/api/register', async (req, res) => {
//     const { studentId, name, email, password } = req.body;
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     try {
//         const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
//         if (existingUser && existingUser.isVerified) {
//             return res.status(400).json({ message: "User already exists." });
//         }
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
//         // Update if exists but not verified, otherwise create new
//         await User.findOneAndUpdate(
//             { email },
//             { studentId, name, password: hashedPassword, otp, isVerified: false },
//             { upsert: true, returnDocument: 'after' }
//         );
//         await resend.emails.send({
//             from: 'Aditya Library Hub <onboarding@resend.dev>',
//             to: email,
//             subject: 'Verify your Aditya Library Account - OTP',
//             html: `Hello ${name}, your verification OTP is: ${otp}`
//         });

//         res.status(201).json({ message: "OTP sent to your email!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error in registration" });
//     }
// });


app.post('/api/resend-otp', async (req, res) => {
    // This now comes directly from your frontend (req.body)
    const { email } = req.body; 
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        // 1. Update the specific user in MongoDB with the new OTP
        const user = await User.findOneAndUpdate(
            { email },
            { otp },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found. Please register first." });
        }

        // 2. Send the OTP to the email provided by the frontend
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: { name: "Aditya Library Hub", email: "suryamamidala75@gmail.com" }, // Sender must stay verified
                to: [{ email: email }], // Now sends to the user's input email
                subject: "Your New Verification OTP - Aditya Library Hub",
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <h2 style="color: #2c3e50;">New Verification Code</h2>
                        <p>Hello, use the code below to complete your verification:</p>
                        <h1 style="background: #f4f4f4; padding: 15px; text-align: center; color: #007bff; letter-spacing: 8px;">
                            ${otp}
                        </h1>
                        <p style="color: #777; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
                    </div>`
            })
        });

        if (response.ok) {
            res.status(200).json({ message: "A new OTP has been sent to " + email });
        } else {
            const errorData = await response.json();
            console.error("Brevo API Error:", errorData);
            res.status(500).json({ message: "Failed to send email. Check backend logs." });
        }

    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ message: "Server error during Resend OTP" });
    }
});


// // Route to Resend OTP
// app.post('/api/resend-otp', async (req, res) => {
//     const { email } = req.body;
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     try {
//         const user = await User.findOneAndUpdate(
//             { email },
//             { otp },
//             { returnDocument: 'after' }
//         );

//         if (!user) return res.status(404).json({ message: "User not found" });

//         await resend.emails.send({
//             from: 'Aditya Library Hub <onboarding@resend.dev>',
//             to: email,
//             subject: 'Your New Verification OTP',
//             html: `<p>Your verification OTP is: <strong>${otp}</strong></p>`
//         });

//         res.status(200).json({ message: "OTP sent successfully!" });
//     } catch (error) {
//         res.status(500).json({ message: "Failed to send OTP" });
//     }
// });


// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email, otp });
        if (user) {
            user.isVerified = true;
            user.otp = null;
            await user.save();
            res.status(200).json({ message: "Email verified successfully!" });
        } else {
            res.status(400).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        res.status(500).json({ message: "Verification failed" });
    }
});



// Book Schema
const bookSchema = new mongoose.Schema({
    bookId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    edition: { type: String },
    rackLocation: { type: String },
    status: {
        type: String,
        enum: ['In Library', 'Issued'],
        default: 'In Library'
    }
});
const Book = mongoose.model('Book', bookSchema);

// --- SEED FUNCTION ---
const seedBooks = async () => {
    try {
        const count = await Book.countDocuments();
        if (count === 0) {
            const initialBooks = [
                { bookId: 201, title: "Data Structures and Algorithms", author: "Narasimha Karumanchi", category: "Core CSE", edition: "5th", rackLocation: "CS-03", status: "In Library" },
                { bookId: 202, title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", category: "AI/ML", edition: "4th", rackLocation: "AI-01", status: "In Library" },
                { bookId: 203, title: "The Pragmatic Programmer", author: "Andrew Hunt", category: "Software Eng", edition: "20th Anniv", rackLocation: "CS-08", status: "In Library" },
                { bookId: 204, title: "Deep Learning", author: "Ian Goodfellow", category: "AI/ML", edition: "1st", rackLocation: "AI-02", status: "In Library" },
                { bookId: 205, title: "Clean Architecture", author: "Robert C. Martin", category: "Software Eng", edition: "1st", rackLocation: "CS-05", status: "In Library" },
                { bookId: 206, title: "Introduction to Algorithms", author: "Thomas H. Cormen", category: "Core CSE", edition: "4th", rackLocation: "CS-03", status: "In Library" },
                { bookId: 207, title: "Cracking the Coding Interview", author: "Gayle Laakmann McDowell", category: "Placements", edition: "6th", rackLocation: "PL-01", status: "In Library" },
                { bookId: 208, title: "Computer Networking: A Top-Down Approach", author: "James Kurose", category: "Networking", edition: "8th", rackLocation: "NW-04", status: "In Library" },
                { bookId: 209, title: "Operating System Concepts", author: "Silberschatz", category: "Core CSE", edition: "10th", rackLocation: "CS-02", status: "In Library" },
                { bookId: 210, title: "Database System Concepts", author: "Abraham Silberschatz", category: "Database", edition: "7th", rackLocation: "DB-01", status: "In Library" },

                // 11-20: Web Development (React, Node, Java)
                { bookId: 211, title: "Eloquent JavaScript", author: "Marijn Haverbeke", category: "Web Dev", edition: "3rd", rackLocation: "WD-01", status: "In Library" },
                { bookId: 212, title: "React Up and Running", author: "Stoyan Stefanov", category: "Web Dev", edition: "2nd", rackLocation: "WD-02", status: "In Library" },
                { bookId: 213, title: "Node.js Design Patterns", author: "Mario Casciaro", category: "Web Dev", edition: "3rd", rackLocation: "WD-03", status: "In Library" },
                { bookId: 214, title: "Effective Java", author: "Joshua Bloch", category: "Java", edition: "3rd", rackLocation: "JV-01", status: "In Library" },
                { bookId: 215, title: "Spring Microservices in Action", author: "John Carnell", category: "Java", edition: "2nd", rackLocation: "JV-02", status: "In Library" },
                { bookId: 216, title: "Fullstack React", author: "Anthony Accomazzo", category: "Web Dev", edition: "1st", rackLocation: "WD-02", status: "In Library" },
                { bookId: 217, title: "Learning MongoDB", author: "Shakuntala Gupta", category: "Database", edition: "2nd", rackLocation: "DB-02", status: "In Library" },
                { bookId: 218, title: "Docker Deep Dive", author: "Nigel Poulton", category: "DevOps", edition: "2023", rackLocation: "DO-01", status: "In Library" },
                { bookId: 219, title: "Kubernetes Up & Running", author: "Brendan Burns", category: "DevOps", edition: "2nd", rackLocation: "DO-02", status: "In Library" },
                { bookId: 220, title: "Head First Design Patterns", author: "Eric Freeman", category: "Software Eng", edition: "2nd", rackLocation: "CS-08", status: "In Library" },

                // 21-30: AI, ML & Data Science
                { bookId: 221, title: "Hands-On Machine Learning", author: "Aurélien Géron", category: "AI/ML", edition: "3rd", rackLocation: "AI-03", status: "In Library" },
                { bookId: 222, title: "Python for Data Analysis", author: "Wes McKinney", category: "Data Science", edition: "3rd", rackLocation: "DS-01", status: "In Library" },
                { bookId: 223, title: "Pattern Recognition", author: "Christopher Bishop", category: "AI/ML", edition: "1st", rackLocation: "AI-04", status: "In Library" },
                { bookId: 224, title: "NLP with Transformers", author: "Lewis Tunstall", category: "AI/ML", edition: "1st", rackLocation: "AI-05", status: "In Library" },
                { bookId: 225, title: "The Hundred-Page Machine Learning Book", author: "Andriy Burkov", category: "AI/ML", edition: "1st", rackLocation: "AI-03", status: "In Library" },
                { bookId: 226, title: "Data Science from Scratch", author: "Joel Grus", category: "Data Science", edition: "2nd", rackLocation: "DS-02", status: "In Library" },
                { bookId: 227, title: "Reinforcement Learning", author: "Richard Sutton", category: "AI/ML", edition: "2nd", rackLocation: "AI-06", status: "In Library" },
                { bookId: 228, title: "Generative Deep Learning", author: "David Foster", category: "AI/ML", edition: "2nd", rackLocation: "AI-02", status: "In Library" },
                { bookId: 229, title: "Computer Vision: Algorithms", author: "Richard Szeliski", category: "AI/ML", edition: "2nd", rackLocation: "AI-07", status: "In Library" },
                { bookId: 230, title: "Applied Predictive Modeling", author: "Max Kuhn", category: "Data Science", edition: "1st", rackLocation: "DS-03", status: "In Library" },

                // 31-40: Systems, Security & Cloud
                { bookId: 231, title: "The Phoenix Project", author: "Gene Kim", category: "DevOps", edition: "10th Anniv", rackLocation: "DO-03", status: "In Library" },
                { bookId: 232, title: "Site Reliability Engineering", author: "Betsy Beyer", category: "DevOps", edition: "1st", rackLocation: "DO-04", status: "In Library" },
                { bookId: 233, title: "CompTIA Security+", author: "Ian Neil", category: "Security", edition: "6th", rackLocation: "SEC-01", status: "In Library" },
                { bookId: 234, title: "Hacking: The Art of Exploitation", author: "Jon Erickson", category: "Security", edition: "2nd", rackLocation: "SEC-02", status: "In Library" },
                { bookId: 235, title: "Cloud Native Patterns", author: "Cornelia Davis", category: "Cloud", edition: "1st", rackLocation: "CL-01", status: "In Library" },
                { bookId: 236, title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", category: "Database", edition: "1st", rackLocation: "DB-04", status: "In Library" },
                { bookId: 237, title: "Modern Operating Systems", author: "Andrew Tanenbaum", category: "Core CSE", edition: "5th", rackLocation: "CS-02", status: "In Library" },
                { bookId: 238, title: "The Art of Unit Testing", author: "Roy Osherove", category: "Software Eng", edition: "3rd", rackLocation: "CS-09", status: "In Library" },
                { bookId: 239, title: "Refactoring", author: "Martin Fowler", category: "Software Eng", edition: "2nd", rackLocation: "CS-09", status: "In Library" },
                { bookId: 240, title: "Code Complete", author: "Steve McConnell", category: "Software Eng", edition: "2nd", rackLocation: "CS-05", status: "In Library" },

                // 41-50: Programming Languages & Placements
                { bookId: 241, title: "The C Programming Language", author: "Kernighan & Ritchie", category: "Core CSE", edition: "2nd", rackLocation: "CS-01", status: "In Library" },
                { bookId: 242, title: "C++ Primer", author: "Stanley Lippman", category: "Core CSE", edition: "5th", rackLocation: "CS-01", status: "In Library" },
                { bookId: 243, title: "Python Crash Course", author: "Eric Matthes", category: "Python", edition: "3rd", rackLocation: "PY-01", status: "In Library" },
                { bookId: 244, title: "Fluent Python", author: "Luciano Ramalho", category: "Python", edition: "2nd", rackLocation: "PY-02", status: "In Library" },
                { bookId: 245, title: "Java: The Complete Reference", author: "Herbert Schildt", category: "Java", edition: "12th", rackLocation: "JV-01", status: "In Library" },
                { bookId: 246, title: "SQL Antipatterns", author: "Bill Karwin", category: "Database", edition: "1st", rackLocation: "DB-03", status: "In Library" },
                { bookId: 247, title: "Algorithms Unlocked", author: "Thomas Cormen", category: "Core CSE", edition: "1st", rackLocation: "CS-03", status: "In Library" },
                { bookId: 248, title: "System Design Interview", author: "Alex Xu", category: "Placements", edition: "Vol 1", rackLocation: "PL-02", status: "In Library" },
                { bookId: 249, title: "Grokking Algorithms", author: "Aditya Bhargava", category: "Core CSE", edition: "1st", rackLocation: "CS-04", status: "In Library" },
                { bookId: 250, title: "Programming Pearls", author: "Jon Bentley", category: "Software Eng", edition: "2nd", rackLocation: "CS-06", status: "In Library" },

                // Focus: VLSI, Embedded, Signal Processing

                { bookId: 401, title: "Microelectronic Circuits", author: "Sedra & Smith", category: "ECE", edition: "8th", rackLocation: "EC-01", status: "In Library" },
                { bookId: 402, title: "Principles of Communication", author: "Herbert Taub", category: "ECE", edition: "4th", rackLocation: "EC-02", status: "In Library" },
                { bookId: 403, title: "Digital Signal Processing", author: "Proakis & Manolakis", category: "ECE", edition: "4th", rackLocation: "EC-04", status: "In Library" },
                { bookId: 404, title: "VLSI Design", author: "Pucknell", category: "ECE", edition: "3rd", rackLocation: "EC-07", status: "In Library" },
                { bookId: 405, title: "Signals and Systems", author: "Oppenheim & Willsky", category: "ECE", edition: "2nd", rackLocation: "EC-03", status: "In Library" },
                { bookId: 406, title: "Antennas and Wave Propagation", author: "John D. Kraus", category: "ECE", edition: "5th", rackLocation: "EC-09", status: "In Library" },
                { bookId: 407, title: "Embedded Systems", author: "Raj Kamal", category: "ECE", edition: "3rd", rackLocation: "EC-12", status: "In Library" },
                { bookId: 408, title: "Digital Logic Design", author: "Morris Mano", category: "ECE", edition: "6th", rackLocation: "EC-01", status: "In Library" },
                { bookId: 409, title: "Electromagnetics", author: "Sadiku", category: "ECE", edition: "7th", rackLocation: "EC-15", status: "In Library" },
                { bookId: 410, title: "Optical Fiber Communications", author: "Gerd Keiser", category: "ECE", edition: "5th", rackLocation: "EC-11", status: "In Library" },
                { bookId: 411, title: "Wireless Communications", author: "Rappaport", category: "ECE", edition: "2nd", rackLocation: "EC-10", status: "In Library" },
                { bookId: 412, title: "Linear Integrated Circuits", author: "Roy Choudhury", category: "ECE", edition: "5th", rackLocation: "EC-05", status: "In Library" },
                { bookId: 413, title: "Analog Communications", author: "Simon Haykin", category: "ECE", edition: "4th", rackLocation: "EC-02", status: "In Library" },
                { bookId: 414, title: "Radar Systems", author: "Skolnik", category: "ECE", edition: "3rd", rackLocation: "EC-14", status: "In Library" },
                { bookId: 415, title: "Control Systems Engineering", author: "Norman Nise", category: "ECE", edition: "7th", rackLocation: "EC-08", status: "In Library" },
                { bookId: 416, title: "Satellite Communications", author: "Timothy Pratt", category: "ECE", edition: "3rd", rackLocation: "EC-13", status: "In Library" },
                { bookId: 417, title: "Information Theory & Coding", author: "S. Gravano", category: "ECE", edition: "1st", rackLocation: "EC-16", status: "In Library" },
                { bookId: 418, title: "CMOS VLSI Design", author: "Weste & Harris", category: "ECE", edition: "4th", rackLocation: "EC-07", status: "In Library" },
                { bookId: 419, title: "Microwave Engineering", author: "David Pozar", category: "ECE", edition: "4th", rackLocation: "EC-17", status: "In Library" },
                { bookId: 420, title: "Microprocessors 8085", author: "Ramesh Gaonkar", category: "ECE", edition: "6th", rackLocation: "EC-12", status: "In Library" },

                // Focus: Machines, Power Systems, Circuits

                { bookId: 501, title: "Electrical Machinery", author: "P.S. Bimbhra", category: "EEE", edition: "7th", rackLocation: "EE-01", status: "In Library" },
                { bookId: 502, title: "Modern Power System Analysis", author: "Kothari & Nagrath", category: "EEE", edition: "4th", rackLocation: "EE-04", status: "In Library" },
                { bookId: 503, title: "Power Electronics", author: "M.H. Rashid", category: "EEE", edition: "4th", rackLocation: "EE-07", status: "In Library" },
                { bookId: 504, title: "Network Analysis", author: "Van Valkenburg", category: "EEE", edition: "3rd", rackLocation: "EE-02", status: "In Library" },
                { bookId: 505, title: "Electrical Circuit Theory", author: "A. Chakrabarti", category: "EEE", edition: "7th", rackLocation: "EE-02", status: "In Library" },
                { bookId: 506, title: "Power System Engineering", author: "Nagrath & Kothari", category: "EEE", edition: "3rd", rackLocation: "EE-04", status: "In Library" },
                { bookId: 507, title: "Utilization of Electric Power", author: "R.K. Rajput", category: "EEE", edition: "2nd", rackLocation: "EE-10", status: "In Library" },
                { bookId: 508, title: "Electrical Measurements", author: "A.K. Sawhney", category: "EEE", edition: "18th", rackLocation: "EE-06", status: "In Library" },
                { bookId: 509, title: "High Voltage Engineering", author: "C.L. Wadhwa", category: "EEE", edition: "6th", rackLocation: "EE-09", status: "In Library" },
                { bookId: 510, title: "Advanced Power Systems", author: "K.R. Padiyar", category: "EEE", edition: "2nd", rackLocation: "EE-05", status: "In Library" },
                { bookId: 511, title: "Electric Drives", author: "G.K. Dubey", category: "EEE", edition: "2nd", rackLocation: "EE-08", status: "In Library" },
                { bookId: 512, title: "Control Systems", author: "I.J. Nagrath", category: "EEE", edition: "6th", rackLocation: "EE-11", status: "In Library" },
                { bookId: 513, title: "Switchgear and Protection", author: "Badri Ram", category: "EEE", edition: "2nd", rackLocation: "EE-13", status: "In Library" },
                { bookId: 514, title: "Basic Electrical Engineering", author: "V.K. Mehta", category: "EEE", edition: "15th", rackLocation: "EE-15", status: "In Library" },
                { bookId: 515, title: "Electromagnetic Fields", author: "William Hayt", category: "EEE", edition: "9th", rackLocation: "EE-14", status: "In Library" },
                { bookId: 516, title: "Renewable Energy Sources", author: "G.D. Rai", category: "EEE", edition: "5th", rackLocation: "EE-18", status: "In Library" },
                { bookId: 517, title: "Smart Grid", author: "James Momoh", category: "EEE", edition: "1st", rackLocation: "EE-19", status: "In Library" },
                { bookId: 518, title: "Analysis of Electric Machinery", author: "Krause", category: "EEE", edition: "3rd", rackLocation: "EE-01", status: "In Library" },
                { bookId: 519, title: "Electric Power Distribution", author: "A.S. Pabla", category: "EEE", edition: "6th", rackLocation: "EE-20", status: "In Library" },
                { bookId: 520, title: "Digital Control Systems", author: "M. Gopal", category: "EEE", edition: "2nd", rackLocation: "EE-11", status: "In Library" },

                // Focus: Thermodynamics, Design, Manufacturing

                { bookId: 601, title: "Engineering Thermodynamics", author: "P.K. Nag", category: "ME", edition: "6th", rackLocation: "ME-01", status: "In Library" },
                { bookId: 602, title: "Theory of Machines", author: "S.S. Rattan", category: "ME", edition: "5th", rackLocation: "ME-04", status: "In Library" },
                { bookId: 603, title: "Design of Machine Elements", author: "V.B. Bhandari", category: "ME", edition: "5th", rackLocation: "ME-07", status: "In Library" },
                { bookId: 604, title: "Internal Combustion Engines", author: "V. Ganesan", category: "ME", edition: "4th", rackLocation: "ME-02", status: "In Library" },
                { bookId: 605, title: "Fluid Mechanics", author: "R.K. Bansal", category: "ME", edition: "10th", rackLocation: "ME-05", status: "In Library" },
                { bookId: 606, title: "Heat and Mass Transfer", author: "R.C. Sachdeva", category: "ME", edition: "5th", rackLocation: "ME-08", status: "In Library" },
                { bookId: 607, title: "Manufacturing Technology", author: "P.N. Rao", category: "ME", edition: "5th", rackLocation: "ME-10", status: "In Library" },
                { bookId: 608, title: "Industrial Engineering", author: "O.P. Khanna", category: "ME", edition: "17th", rackLocation: "ME-15", status: "In Library" },
                { bookId: 609, title: "Kinematics of Machinery", author: "Uicker & Pennock", category: "ME", edition: "5th", rackLocation: "ME-04", status: "In Library" },
                { bookId: 610, title: "Strength of Materials", author: "R.K. Rajput", category: "ME", edition: "7th", rackLocation: "ME-11", status: "In Library" },
                { bookId: 611, title: "Automobile Engineering", author: "Kirpal Singh", category: "ME", edition: "13th", rackLocation: "ME-18", status: "In Library" },
                { bookId: 612, title: "CAD/CAM", author: "Groover & Zimmers", category: "ME", edition: "1st", rackLocation: "ME-19", status: "In Library" },
                { bookId: 613, title: "Refrigeration & Air Conditioning", author: "C.P. Arora", category: "ME", edition: "4th", rackLocation: "ME-14", status: "In Library" },
                { bookId: 614, title: "Gas Turbines", author: "V. Ganesan", category: "ME", edition: "3rd", rackLocation: "ME-02", status: "In Library" },
                { bookId: 615, title: "Robotics and Control", author: "Mittal & Nagrath", category: "ME", edition: "1st", rackLocation: "ME-20", status: "In Library" },
                { bookId: 616, title: "Mechatronics", author: "W. Bolton", category: "ME", edition: "7th", rackLocation: "ME-21", status: "In Library" },
                { bookId: 617, title: "Operations Research", author: "Hira & Gupta", category: "ME", edition: "10th", rackLocation: "ME-16", status: "In Library" },
                { bookId: 618, title: "Machine Design", author: "Shigley", category: "ME", edition: "11th", rackLocation: "ME-07", status: "In Library" },
                { bookId: 619, title: "Power Plant Engineering", author: "P.K. Nag", category: "ME", edition: "4th", rackLocation: "ME-01", status: "In Library" },
                { bookId: 620, title: "Tribology", author: "B.C. Majumdar", category: "ME", edition: "2nd", rackLocation: "ME-25", status: "In Library" },

                // Focus: Structures, Geotech, Surveying

                { bookId: 701, title: "Structural Analysis", author: "C.S. Reddy", category: "CE", edition: "3rd", rackLocation: "CE-01", status: "In Library" },
                { bookId: 702, title: "Soil Mechanics", author: "Gopal Ranjan", category: "CE", edition: "3rd", rackLocation: "CE-05", status: "In Library" },
                { bookId: 703, title: "Surveying Vol 1", author: "B.C. Punmia", category: "CE", edition: "17th", rackLocation: "CE-03", status: "In Library" },
                { bookId: 704, title: "Concrete Technology", author: "M.S. Shetty", category: "CE", edition: "8th", rackLocation: "CE-08", status: "In Library" },
                { bookId: 705, title: "Reinforced Concrete Design", author: "S.N. Sinha", category: "CE", edition: "4th", rackLocation: "CE-01", status: "In Library" },
                { bookId: 706, title: "Fluid Mechanics", author: "Modi & Seth", category: "CE", edition: "22nd", rackLocation: "CE-10", status: "In Library" },
                { bookId: 707, title: "Highway Engineering", author: "Khanna & Justo", category: "CE", edition: "10th", rackLocation: "CE-12", status: "In Library" },
                { bookId: 708, title: "Environmental Engineering", author: "S.K. Garg", category: "CE", edition: "33rd", rackLocation: "CE-15", status: "In Library" },
                { bookId: 709, title: "Steel Structures", author: "S.K. Duggal", category: "CE", edition: "3rd", rackLocation: "CE-02", status: "In Library" },
                { bookId: 710, title: "Irrigation Engineering", author: "B.C. Punmia", category: "CE", edition: "16th", rackLocation: "CE-14", status: "In Library" },
                { bookId: 711, title: "Foundation Engineering", author: "V.N.S. Murthy", category: "CE", edition: "2nd", rackLocation: "CE-05", status: "In Library" },
                { bookId: 712, title: "Building Construction", author: "Sushil Kumar", category: "CE", edition: "20th", rackLocation: "CE-09", status: "In Library" },
                { bookId: 713, title: "Prestressed Concrete", author: "N. Krishna Raju", category: "CE", edition: "6th", rackLocation: "CE-02", status: "In Library" },
                { bookId: 714, title: "Geotechnical Engineering", author: "K.R. Arora", category: "CE", edition: "7th", rackLocation: "CE-05", status: "In Library" },
                { bookId: 715, title: "Bridge Engineering", author: "Ponnuswamy", category: "CE", edition: "3rd", rackLocation: "CE-18", status: "In Library" },
                { bookId: 716, title: "Hydrology", author: "K. Subramanya", category: "CE", edition: "4th", rackLocation: "CE-10", status: "In Library" },
                { bookId: 717, title: "Transportation Engineering", author: "C. Venkatramaiah", category: "CE", edition: "2nd", rackLocation: "CE-12", status: "In Library" },
                { bookId: 718, title: "Estimation & Costing", author: "B.N. Dutta", category: "CE", edition: "28th", rackLocation: "CE-20", status: "In Library" },
                { bookId: 719, title: "Railway Engineering", author: "Saxena & Arora", category: "CE", edition: "7th", rackLocation: "CE-21", status: "In Library" },
                { bookId: 720, title: "Waste Water Engineering", author: "Metcalf & Eddy", category: "CE", edition: "5th", rackLocation: "CE-15", status: "In Library" },

                // Focus: Math, Physics, Chemistry, English

                { bookId: 801, title: "Higher Engineering Mathematics", author: "B.S. Grewal", category: "Math", edition: "44th", rackLocation: "MA-01", status: "In Library" },
                { bookId: 802, title: "Advanced Engineering Mathematics", author: "Erwin Kreyszig", category: "Math", edition: "10th", rackLocation: "MA-02", status: "In Library" },
                { bookId: 803, title: "Engineering Physics", author: "Gaur & Gupta", category: "Physics", edition: "8th", rackLocation: "PH-01", status: "In Library" },
                { bookId: 804, title: "Engineering Chemistry", author: "Jain & Jain", category: "Chemistry", edition: "16th", rackLocation: "CH-01", status: "In Library" },
                { bookId: 805, title: "Communication Skills", author: "Sanjay Kumar", category: "English", edition: "2nd", rackLocation: "EN-01", status: "In Library" },
                { bookId: 806, title: "Calculus", author: "James Stewart", category: "Math", edition: "9th", rackLocation: "MA-05", status: "In Library" },
                { bookId: 807, title: "Linear Algebra", author: "Gilbert Strang", category: "Math", edition: "5th", rackLocation: "MA-04", status: "In Library" },
                { bookId: 808, title: "Modern Physics", author: "Arthur Beiser", category: "Physics", edition: "6th", rackLocation: "PH-03", status: "In Library" },
                { bookId: 809, title: "Probability & Statistics", author: "Miller & Freund", category: "Math", edition: "9th", rackLocation: "MA-06", status: "In Library" },
                { bookId: 810, title: "Organic Chemistry", author: "Morrison & Boyd", category: "Chemistry", edition: "7th", rackLocation: "CH-03", status: "In Library" },
                { bookId: 811, title: "Optics", author: "Ajoy Ghatak", category: "Physics", edition: "7th", rackLocation: "PH-05", status: "In Library" },
                { bookId: 812, title: "Numerical Methods", author: "S.S. Sastry", category: "Math", edition: "5th", rackLocation: "MA-08", status: "In Library" },
                { bookId: 813, title: "Business Communication", author: "Meenakshi Raman", category: "English", edition: "3rd", rackLocation: "EN-03", status: "In Library" },
                { bookId: 814, title: "Solid State Physics", author: "Charles Kittel", category: "Physics", edition: "8th", rackLocation: "PH-07", status: "In Library" },
                { bookId: 815, title: "Differential Equations", author: "Shepley Ross", category: "Math", edition: "3rd", rackLocation: "MA-10", status: "In Library" },
                { bookId: 816, title: "Engineering Graphics", author: "N.D. Bhatt", category: "Graphics", edition: "53rd", rackLocation: "GR-01", status: "In Library" },
                { bookId: 817, title: "Professional Ethics", author: "R. Subramanian", category: "Humanities", edition: "2nd", rackLocation: "HU-01", status: "In Library" },
                { bookId: 818, title: "Quantum Mechanics", author: "David Griffiths", category: "Physics", edition: "3rd", rackLocation: "PH-09", status: "In Library" },
                { bookId: 819, title: "Complex Variables", author: "Churchill & Brown", category: "Math", edition: "9th", rackLocation: "MA-12", status: "In Library" },
                { bookId: 820, title: "Environmental Studies", author: "Benny Joseph", category: "Sciences", edition: "3rd", rackLocation: "SC-01", status: "In Library" },
            ];
            await Book.insertMany(initialBooks);
            console.log("🌱 Database seeded with books.");
        }
    } catch (err) {
        console.error("Seed Error:", err);
    }
};

// --- Updated Stats Route  dashboard---
app.get('/api/admin/stats', async (req, res) => {
    try {
        // 1. Total count of all documents in the books collection
        const totalBooks = await Book.countDocuments();
        // 2. Count based on your "status" attribute
        // Assuming your statuses are 'Borrowed' (or 'Issued') and 'Available'
        const borrowedBooks = await Book.countDocuments({ status: 'Issued' });
        const availableBooks = await Book.countDocuments({ status: 'In Library' });
        res.json({
            totalBooks,
            borrowedBooks,
            availableBooks
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Error fetching library statistics" });
    }
});


// --- 1. BorrowedBooks Schema Update ---
const borrowSchema = new mongoose.Schema({
    bookId: { type: String, required: true,unique: true }, // REMOVED 'unique: true' to allow re-issuing books over time
    studentId: { type: String, required: true },
    issuedDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    status: { type: String, default: 'Issued' } 
});

const BorrowedBook = mongoose.model('borrowbooks', borrowSchema);


// --- 2. Corrected Issue Multiple Books Route ---
app.post('/api/admin/issue-book', async (req, res) => {
    try {
        const { bookIds, studentId } = req.body;

        // Basic Validation
        if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
            return res.status(400).json({ message: "No books provided." });
        }

        // 1. Fetch Student
        const student = await User.findOne({ studentId: studentId });
        if (!student) {
            return res.status(404).json({ message: "Student ID not found in database." });
        }

        const today = new Date();
        const returnDate = new Date();
        returnDate.setMonth(today.getMonth() + 1);

        let issuedBooksDetails = [];

        // 2. Process each Book ID
        for (const bId of bookIds) {
            const book = await Book.findOne({ bookId: bId });

            if (!book) {
                return res.status(400).json({ message: `Book ID ${bId} not found.` });
            }
            
            // Critical check: Is it already out?
            if (book.status === 'Issued') {
                return res.status(400).json({ message: `Book "${book.title}" is already out.` });
            }

            // Save Borrow Record
            const newBorrowRecord = new BorrowedBook({
                bookId: bId,
                studentId,
                issuedDate: today,
                returnDate: returnDate,
                status: 'Issued'
            });

            // Update Book Status in the 'Book' collection
            book.status = 'Issued';

            // Wait for both saves to finish
            await newBorrowRecord.save();
            await book.save();

            issuedBooksDetails.push({ id: bId, title: book.title });
        }

        // 3. Email Logic (Brevo Fetch)
        try {
            const booksListHtml = issuedBooksDetails
                .map(b => `<li><b>${b.title}</b> (ID: ${b.id})</li>`)
                .join('');

            // Send via Brevo API
            fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    sender: { name: "Aditya Library Hub", email: "suryamamidala75@gmail.com" },
                    to: [{ email: student.email }],
                    subject: '📚 Books Issued - Aditya Library Hub',
                    htmlContent: `
                     <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #2c3e50;">Aditya Library Confirmation</h2>
                        <p>Hello <b>${student.name}</b> (ID: ${student.studentId}),</p>
                        <p>The following books have been successfully issued to your account:</p>
                        <hr>
                        <ul style="list-style-type: none; padding-left: 0;">
                            ${booksListHtml}
                        </ul>
                        <hr>
                        <p><b>Issue Date:</b> ${today.toDateString()}</p>
                        <p><b>Return Date:</b> <span style="color: #e74c3c; font-weight: bold;">${returnDate.toDateString()}</span></p>
                        <p><i>Please ensure the books are returned by the due date to avoid late fees. Happy reading!</i></p>
                    </div>`
                })
            }).catch(mailErr => {
                console.error("Email failed background:", mailErr.message);
            });

            // Success response (outside the fetch promise to avoid hanging)
            return res.status(200).json({
                message: `${issuedBooksDetails.length} books issued successfully!`,
                details: { studentName: student.name }
            });

        } catch (mailErr) {
            console.error("Email logic error but books were issued:", mailErr);
            // Still return success because DB was updated
            return res.status(200).json({
                message: `${issuedBooksDetails.length} books issued successfully!`,
                details: { studentName: student.name }
            });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});




// --- NEW FETCH BOOKS ROUTE ---
app.get('/api/admin/student-books/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // 1. Find all active 'Issued' records for this student
        const borrowedRecords = await BorrowedBook.find({
            studentId: studentId,
            status: 'Issued'
        });

        // 2. If no records found, send a 404
        if (!borrowedRecords || borrowedRecords.length === 0) {
            return res.status(404).json({
                message: "No active issued books found for this Student ID."
            });
        }

        // 3. Loop through records to calculate fines and get titles
        const results = await Promise.all(borrowedRecords.map(async (record) => {
            // Find the book details in the main catalog
            const bookInfo = await Book.findOne({ bookId: record.bookId });

            // Calculate Fine: ₹10 per day after returnDate
            const today = new Date();
            const dueDate = new Date(record.returnDate);
            let fine = 0;

            if (today > dueDate) {
                const diffTime = Math.abs(today - dueDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                fine = diffDays * 10;
            }

            return {
                bookId: record.bookId,
                title: bookInfo ? bookInfo.title : "Unknown Title",
                issuedDate: record.issuedDate,
                dueDate: record.returnDate,
                fine: fine
            };
        }));

        // 4. Send the array of books to the frontend
        res.status(200).json(results);

    } catch (error) {
        console.error("Fetch Books Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// --- CORRECTED RETURN BOOKS ROUTE ---
app.post('/api/admin/return-books', async (req, res) => {
    try {
        const { studentId, bookIds } = req.body;

        // 1. Validation & Student Fetch
        if (!studentId || !bookIds || !Array.isArray(bookIds)) {
            return res.status(400).json({ message: "Invalid request data." });
        }

        const student = await User.findOne({ studentId });
        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        const today = new Date();
        let totalFine = 0;
        let returnedBooksDetails = [];

        // 2. Process each Book ID using for...of for proper async handling
        for (const bId of bookIds) {
            // Find active issued record
            const record = await BorrowedBook.findOne({ bookId: bId, studentId, status: 'Issued' });

            if (record) {
                const book = await Book.findOne({ bookId: bId });

                // Calculate Fine (₹10 per day)
                const expectedReturnDate = new Date(record.returnDate);
                let bookFine = 0;

                if (today > expectedReturnDate) {
                    const diffTime = Math.abs(today - expectedReturnDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    bookFine = diffDays * 10;
                }

                totalFine += bookFine;

                // 3. Update Catalog and Borrow Record
                await BorrowedBook.findOneAndDelete({ bookId: bId, studentId });
                await Book.findOneAndUpdate({ bookId: bId }, { status: 'In Library' });

                returnedBooksDetails.push({
                    title: book ? book.title : "Unknown Title",
                    id: bId,
                    fine: bookFine
                });
            }
        }

        // 4. Final Verification
        if (returnedBooksDetails.length === 0) {
            return res.status(400).json({ message: "No active issued records found for selected books." });
        }

        // 5. Send Consolidated Return Confirmation Email (Brevo Fetch)
        const booksHtmlList = returnedBooksDetails.map(b => `
            <li style="margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                <div style="font-size: 16px; color: #2c3e50;"><b>${b.title}</b></div>
                <div style="font-size: 13px; color: #7f8c8d;">Book ID: ${b.id}</div>
                <div style="font-size: 14px; color: ${b.fine > 0 ? '#e74c3c' : '#27ae60'}; font-weight: bold;">
                    Fine: ₹${b.fine}
                </div>
            </li>
        `).join('');

        const emailBody = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; border: 1px solid #e0e0e0; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #27ae60; margin: 0;">Return Successful</h2>
                    <p style="color: #7f8c8d; font-size: 14px;">Aditya Library Hub Confirmation</p>
                </div>
                
                <p>Hello <b>${student.name}</b>,</p>
                <p>Your ID: <b>${student.studentId}</b></p>
                <p>The following books have been successfully returned to the library:</p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                
                <ul style="list-style: none; padding-left: 0;">
                    ${booksHtmlList}
                </ul>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <table width="100%">
                        <tr>
                            <td style="font-size: 16px; color: #2c3e50;"><b>Total Fine Charged:</b></td>
                            <td style="text-align: right; font-size: 20px; color: ${totalFine > 0 ? '#e74c3c' : '#27ae60'}; font-weight: bold;">
                                ₹${totalFine}
                            </td>
                        </tr>
                        <tr>
                            <td style="font-size: 14px; color: #7f8c8d;">Return Date:</td>
                            <td style="text-align: right; font-size: 14px; color: #7f8c8d;">${today.toDateString()}</td>
                        </tr>
                    </table>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                
                <p style="text-align: center; color: #95a5a6; font-size: 13px; font-style: italic;">
                    "The more that you read, the more things you will know. The more that you learn, the more places you'll go."
                </p>
                <p style="text-align: center; color: #27ae60; font-weight: bold; margin-bottom: 0;">
                    Thank you for using Aditya Library Hub!
                </p>
            </div>`;

        // Brevo API Call
        fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: { name: "Aditya Library Hub", email: "suryamamidala75@gmail.com" },
                to: [{ email: student.email }],
                subject: '📚 Books Returned - Aditya Library Hub',
                htmlContent: emailBody
            })
        }).catch(mailErr => {
            console.error("Email failed background:", mailErr.message);
        });

        // 6. Return Success Response immediately
        res.status(200).json({
            message: "Books returned successfully!",
            totalFine: totalFine,
            count: returnedBooksDetails.length
        });

    } catch (error) {
        console.error("Return Process Error:", error);
        res.status(500).json({ message: "Internal Server Error during return processing." });
    }
});

//admin books page
// Add this route to your server.js
// It handles: Initial Load (All Books), Live Search, and Sorting
app.get('/api/admin/adminallbooks', async (req, res) => {
    try {
        const { search, sort } = req.query;
        // 1. Initialize an empty query (This returns ALL books by default)
        let query = {};
        // 2. If a search term exists, narrow down the results
        if (search && search.trim() !== "") {
            const isNumber = !isNaN(search); // Check if the search term is a number
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { author: { $regex: search, $options: 'i' } },
                    // Only search bookId if the input is a valid number to prevent CastError
                    ...(isNumber ? [{ bookId: Number(search) }] : [])
                ]
            };
        }
        // 3. Define sorting logic
        let sortOptions = {};
        if (sort === 'title') {
            sortOptions = { title: 1 }; // Alphabetical A-Z
        } else if (sort === 'category') {
            sortOptions = { category: 1 }; // Group by category
        } else if (sort === 'newest') {
            sortOptions = { _id: -1 }; // Shows the most recently created records first
        } else {
            // Default sort: show latest additions first
            sortOptions = { _id: -1 };
        }
        // 4. Execute the query
        // find(query) will be find({}) if no search is provided, showing all books.
        const books = await Book.find(query).sort(sortOptions);
        res.status(200).json(books);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Failed to fetch books from database" });
    }
});


//edit book
// Route to edit a book by ID
app.put('/api/admin/edit-book/:id', async (req, res) => {
    try {
        const { title, author, category, rackLocation } = req.body;
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            { title, author, category, rackLocation },
            { new: true } // Returns the modified document
        );
        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.status(200).json(updatedBook);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating book" });
    }
});


//add books
app.post('/api/admin/add-multiple-books', async (req, res) => {
    try {
        const { books } = req.body;
        // Optional: Check if any bookId already exists
        const ids = books.map(b => b.bookId);
        const existing = await Book.findOne({ bookId: { $in: ids } });
        if (existing) {
            return res.status(400).json({ message: `Book ID ${existing.bookId} already exists!` });
        }
        await Book.insertMany(books);
        res.status(201).json({ message: "Books added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//issued boooks
// Route to get issued books with optional search filtering
// server.js
app.get('/api/admin/issued-books', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search && search.trim() !== "") {
            const searchRegex = { $regex: search, $options: 'i' };
            // Check if search is a valid number to avoid casting errors
            const isNumeric = !isNaN(search) && !isNaN(parseFloat(search));
            query = {
                $or: [
                    { studentId: searchRegex },
                    // Only include bookId in search if it's a valid number
                    ...(isNumeric ? [{ bookId: Number(search) }] : [])
                ]
            };
        }
        // Fetch logs from your borrow collection
        const issuedBooks = await BorrowedBook.find(query).sort({ issuedDate: -1 });
        // server.js updated mapping logic
        const formattedBooks = issuedBooks.map(book => {
            const rawIssuedDate = book.issuedDate;
            const rawReturnDate = book.returnDate;
            // Helper to safely convert to ISO or return null
            const safeISO = (d) => {
                const dateObj = new Date(d);
                return !isNaN(dateObj.getTime()) ? dateObj.toISOString() : null;
            };
            return {
                ...book._doc,
                issuedDate: rawIssuedDate ? safeISO(rawIssuedDate) : null,
                returnDate: rawReturnDate ? safeISO(rawReturnDate) : null
            };
        });
        res.status(200).json(formattedBooks);
    } catch (err) {
        console.error("Backend Error:", err);
        // This sends the actual error message to help you debug
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

//DELETE book  server.js
app.delete('/api/admin/remove-book/:bookId', async (req, res) => {
    try {
        const { bookId } = req.params;
        // Convert to Number if your bookId is stored as a numeric type
        const numericId = Number(bookId);
        const deletedBook = await Book.findOneAndDelete({ bookId: numericId });
        if (!deletedBook) {
            return res.status(404).json({ message: "Book ID not found in catalog." });
        }
        res.status(200).json({ message: `Book #${bookId} successfully removed.` });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

// Temporary store for OTPs (In production, use Redis or a DB collection)
// let otpStore = {};
// 1. Get Profile Details
app.get('/api/admin/profile/:id', async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select('-password');
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile" });
    }
});

// 2. Change Password (Authenticated)
app.put('/api/admin/change-password', async (req, res) => {
    const { adminId, currentPassword, newPassword } = req.body;
    try {
        const admin = await Admin.findById(adminId);
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });

        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// // 3. Forgot Password - Send OTP

// Ensure this is at the top of your file!
const otpStore = {}; 

app.post('/api/admin/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // 1. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store the OTP (Make sure otpStore is defined at the top of your file)
        otpStore[email] = otp;

        // 2. Send Mail via Brevo API
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY, // Ensure this is set in your .env or Render
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: { name: "Aditya Library Hub", email: "suryamamidala75@gmail.com" },
                to: [{ email: email }],
                subject: "Admin Password Reset OTP - Aditya Library Hub",
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #e67e22;">Password Reset Request</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset your password. Use the OTP below to proceed:</p>
                        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">
                            ${otp}
                        </div>
                        <p style="margin-top: 20px; color: #7f8c8d; font-size: 12px;">If you did not request this, please ignore this email.</p>
                    </div>`
            })
        });

        // 3. Check for API success
        if (response.ok) {
            res.json({ message: "OTP sent to email" });
        } else {
            const errorData = await response.json();
            console.error("Brevo Error:", errorData);
            res.status(500).json({ message: "Failed to send OTP. Please try again." });
        }
        
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Server error. Check backend logs." });
    }
});


// 4. Verify OTP & Reset
app.post('/api/admin/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (otpStore[email] === otp) {
        const admin = await Admin.findOne({ email });
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();
        delete otpStore[email];
        res.json({ message: "Password reset successful" });
    } else {
        res.status(400).json({ message: "Invalid OTP" });
    }
});


// const bcrypt = require('bcryptjs'); // Make sure this is installed and imported
app.post('/api/student/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // CORRECT WAY: Compare plain text login password with hashed DB password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }
        if (!user.isVerified) {
            return res.status(403).json({ 
                message: "Email not verified", 
                unverified: true,
                email: user.email 
            });
        }
        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


//student borrowed books
app.get('/api/borrowed/:mongoId', async (req, res) => {
    try {
        const { mongoId } = req.params;
        // console.log(mongoId);
        const studentRecord = await User.findById(mongoId).select('studentId');
        // console.log(studentRecord);
        const stdid = studentRecord.studentId;
        // console.log(stdid);
        const borrowedBooks = await BorrowedBook.find({ studentId: stdid });
        // If no books found, find() returns an empty array [], so this check is safe
        if (!borrowedBooks || borrowedBooks.length === 0) {
            console.log("empty")
            return res.status(200).json([]);
        }
        res.status(200).json(borrowedBooks);
    } catch (err) {
        console.error("Backend error fetching borrowed books:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});





// 1. Get Profile Details
app.get('/api/student/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile" });
    }
});



// 5. Change Password (for logged-in students)
app.post('/api/student/change-password', async (req, res) => {
    const { id, currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify the current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        // Hash and save the new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating password" });
    }
});
// 3. Forgot Password - Send OTP
app.post('/api/student/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // 1. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP in your global otpStore
        otpStore[email] = otp;

        // 2. Send Email via Brevo Fetch
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY, // Ensure this is in your Render/local .env
                "content-type": "application/json"
            },
            body: JSON.stringify({
                // Sender must be your verified Brevo email
                sender: { name: "Aditya Library Hub", email: "suryamamidala75@gmail.com" },
                to: [{ email: email }],
                subject: "Student Password Reset OTP - Aditya Library Hub",
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 25px; border-radius: 12px; max-width: 500px;">
                        <h2 style="color: #2c3e50; text-align: center;">Reset Your Password</h2>
                        <p>Hi there,</p>
                        <p>We received a request to reset the password for your student account. Please use the following One-Time Password (OTP):</p>
                        <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #007bff; border-radius: 8px; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p style="font-size: 12px; color: #999; text-align: center;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
                    </div>`
            })
        });

        // 3. Handle the response
        if (response.ok) {
            console.log(`OTP sent successfully to ${email}`);
            res.json({ message: "OTP sent to email" });
        } else {
            const errorData = await response.json();
            console.error("Brevo API Error:", errorData);
            res.status(500).json({ message: "Failed to send OTP. Please try again later." });
        }

    } catch (error) {
        console.error("Student Forgot Password Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
// 4. Verify OTP & Reset
app.post('/api/student/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (otpStore[email] === otp) {
        const user = await User.findOne({ email });
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        delete otpStore[email];
        res.json({ message: "Password reset successful" });
    } else {
        res.status(400).json({ message: "Invalid OTP" });
    }
});



const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});