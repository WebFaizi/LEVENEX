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
exports.sendOtpToEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendOtpToEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
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
        yield transporter.sendMail({
            from: "rentaltest0@gmail.com",
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
        });
        console.log(`OTP sent to ${email}: ${otp}`);
    }
    catch (error) {
        console.error("Error sending OTP email:", error);
    }
});
exports.sendOtpToEmail = sendOtpToEmail;
//# sourceMappingURL=otp.service.js.map