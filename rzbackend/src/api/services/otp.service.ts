import nodemailer from "nodemailer";

export const sendOtpToEmail = async (email: string, otp: number) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "in-v3.mailjet.com",
            port: 465, 
            secure: false, 
            auth: {
                user: "4ef2e51393517b21366a21e504b1c3b1",
                pass: "bef9b85cbbe942dc8bce3d8fcddea51a",
            },
            tls: {
                rejectUnauthorized: false, 
            },
        });

        await transporter.sendMail({
            from: "rentaltest0@gmail.com",
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
        });

        console.log(`OTP sent to ${email}: ${otp}`);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
};
