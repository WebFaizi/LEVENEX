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
Object.defineProperty(exports, "__esModule", { value: true });
const sendEmail_service_1 = require("./sendEmail.service");
class EmailQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.delayBetweenEmails = 10000; // 2 seconds delay
    }
    add(emailConfig) {
        this.queue.push(emailConfig);
        this.processQueue();
    }
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.processing || this.queue.length === 0)
                return;
            this.processing = true;
            while (this.queue.length > 0) {
                const emailConfig = this.queue.shift();
                if (emailConfig) {
                    try {
                        yield sendEmail_service_1.EmailService.sendEmail(emailConfig.to, emailConfig.subject, emailConfig.html, emailConfig.from);
                        console.log(`✅ Email sent successfully to ${emailConfig.to}`);
                    }
                    catch (error) {
                        console.error(`❌ Failed to send email to ${emailConfig.to}:`, error);
                    }
                }
                // Wait before sending next email
                if (this.queue.length > 0) {
                    yield new Promise(resolve => setTimeout(resolve, this.delayBetweenEmails));
                }
            }
            this.processing = false;
        });
    }
}
exports.default = new EmailQueue();
//# sourceMappingURL=emailQueue.service.js.map