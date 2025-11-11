import { loggerMsg } from "../../lib/logger";
import ContactUsSchema from "../schema/contactus.scheam"; 
import { EmailService } from "../../services/sendEmail.service";
import settingSchema from '../../domain/schema/setting.schema';
interface contactus {
    name: string;
    email: string;
    subject: string;
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export const submitContactUsFormModel = async (contactData: contactus, callback: (error: any, result: any) => void) => {
    try {
        const storeContactus = new ContactUsSchema({
            name: contactData.name,
            email: contactData.email,
            subject: contactData.subject
        });

        const saveContactUs = await storeContactus.save();

        // Immediately return success to the client
        callback(null, { saveContactUs });

        // ---- Send emails in the background (non-blocking) ----
        (async () => {
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

                const settings = await settingSchema.findOne({});
                const settingsEmails = settings?.contact_email
                    ? settings.quotation_emails.split(',').map(email => email.trim())
                    : [];

                for (const adminEmail of settingsEmails) {
                    if (isValidEmail(adminEmail)) {
                        await EmailService.sendEmail(adminEmail, `New contact us from ${contactData.name}`, html, contactData.name);
                    }
                }
            } catch (emailError) {
                loggerMsg('Error sending contact us email:');
            }
        })();

    } catch (error) {
        console.error("Error storing contact us form:", error);
        return callback(error, null);
    }
};
