"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../../api/lib/logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST || "mail.laptoprental.co", // Use environment variable or default to your SMTP host
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587, // Use environment variable or default to 587            
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});
// transporter.verify(function(error, success) {
//   if (error) {
//     console.error("SMTP connection error:", error);
//   } else {  
//   }
// });
exports.EmailService = {
    sendEmail(to, subject, htmlContent, username) {
        return __awaiter(this, void 0, void 0, function* () {
            // Always normalize the sender name (fix common typo "Laptoponrent" -> "Laptoprental")
            const rawSenderName = username ? String(username) : (process.env.PLATFORMNAME || 'Laptoprental');
            const getEmailuser = rawSenderName.replace(/Laptoponrent/gi, 'Laptoprental');
            console.log('getEmailuser:', getEmailuser);
            const mailOptions = {
                from: `"${getEmailuser}" <${process.env.EMAIL_USER}>`, // Use the environment variable for the sender's email
                to: to.trim(), // Ensure the recipient's email is trimmed of whitespace
                subject,
                html: htmlContent, htmlContent
            };
            try {
                const info = yield transporter.sendMail(mailOptions);
                (0, logger_1.loggerMsg)("✅ sending mail ss successfully.");
                return info;
            }
            catch (error) {
                (0, logger_1.loggerMsg)("✅ sending mail ss successfully not working.");
                console.error(`❌ Failed to send email to ${to}:`, error);
                throw error;
            }
        });
    },
};
//# sourceMappingURL=sendEmail.service.js.map