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
exports.submitContactUsFormModel = void 0;
const logger_1 = require("../../lib/logger");
const contactus_scheam_1 = __importDefault(require("../schema/contactus.scheam"));
const sendEmail_service_1 = require("../../services/sendEmail.service");
const setting_schema_1 = __importDefault(require("../../domain/schema/setting.schema"));
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
const submitContactUsFormModel = (contactData, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storeContactus = new contactus_scheam_1.default({
            name: contactData.name,
            email: contactData.email,
            subject: contactData.subject
        });
        const saveContactUs = yield storeContactus.save();
        // Immediately return success to the client
        callback(null, { saveContactUs });
        // ---- Send emails in the background (non-blocking) ----
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const html = `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="UTF-8">
                            <title>New Contact Us Submission</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    color: #333;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: auto;
                                    padding: 20px;
                                    border: 1px solid #eee;
                                    background-color: #f9f9f9;
                                }
                                h2 {
                                    color: #0073e6;
                                }
                                .details {
                                    margin-top: 20px;
                                }
                                .details p {
                                    margin: 5px 0;
                                }
                                .footer {
                                    margin-top: 30px;
                                    font-size: 12px;
                                    color: #888;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h2>📬 New Contact Us Message</h2>
                                <p>Hello Admin,</p>
                                <p>You have received a new message via the contact form:</p>
                                <div class="details">
                                    <p><strong>Name:</strong> ${contactData.name}</p>
                                    <p><strong>Email:</strong> ${contactData.email}</p>
                                    <p><strong>Subject:</strong> ${contactData.subject}</p>
                                </div>
                                <div class="footer">
                                    <p>This email was generated automatically from your website contact form.</p>
                                </div>
                            </div>
                        </body>
                    </html>
                `;
                const settings = yield setting_schema_1.default.findOne({});
                const settingsEmails = (settings === null || settings === void 0 ? void 0 : settings.contact_email)
                    ? settings.quotation_emails.split(',').map(email => email.trim())
                    : [];
                for (const adminEmail of settingsEmails) {
                    if (isValidEmail(adminEmail)) {
                        yield sendEmail_service_1.EmailService.sendEmail(adminEmail, `New contact us from ${contactData.name}`, html, contactData.name);
                    }
                }
            }
            catch (emailError) {
                (0, logger_1.loggerMsg)('Error sending contact us email:');
            }
        }))();
    }
    catch (error) {
        console.error("Error storing contact us form:", error);
        return callback(error, null);
    }
});
exports.submitContactUsFormModel = submitContactUsFormModel;
//# sourceMappingURL=contactus.model.js.map