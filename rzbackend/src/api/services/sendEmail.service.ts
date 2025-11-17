import nodemailer from 'nodemailer';
import { loggerMsg } from "../../api/lib/logger";
import dotenv from 'dotenv';
import e from 'express';
dotenv.config();
const transporter = nodemailer.createTransport({
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

export const EmailService = {

  
  async sendEmail(to: string, subject: string, htmlContent: string, username?:string | null,) {
  // Always normalize the sender name (fix common typo "Laptoponrent" -> "Laptoprental")
  const rawSenderName = username ? String(username) : (process.env.PLATFORMNAME || 'Laptoprental');
  const getEmailuser = rawSenderName.replace(/Laptoponrent/gi, 'Laptoprental');
  console.log('getEmailuser:', getEmailuser);
  const mailOptions = {    
        from: `"${getEmailuser}" <${process.env.EMAIL_USER}>`, // Use the environment variable for the sender's email
        to: to.trim(), // Ensure the recipient's email is trimmed of whitespace
        subject,
        html: htmlContent,htmlContent
      };
    try {
      const info = await transporter.sendMail(mailOptions);
      loggerMsg("✅ sending mail ss successfully.");      
      return info;
    } catch (error) {
      loggerMsg("✅ sending mail ss successfully not working.");
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  },
};
