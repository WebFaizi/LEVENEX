import { EmailService } from "./sendEmail.service";

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailQueue {
  private queue: EmailConfig[] = [];
  private processing: boolean = false;
  private delayBetweenEmails: number = 10000; // 2 seconds delay

  public add(emailConfig: EmailConfig): void {
    this.queue.push(emailConfig);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;

    while (this.queue.length > 0) {
      const emailConfig = this.queue.shift();
      if (emailConfig) {
        try {
          await EmailService.sendEmail(
            emailConfig.to,
            emailConfig.subject,
            emailConfig.html,
            emailConfig.from
          );
          console.log(`✅ Email sent successfully to ${emailConfig.to}`);
        } catch (error) {
          console.error(`❌ Failed to send email to ${emailConfig.to}:`, error);
        }
      }
      
      // Wait before sending next email
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delayBetweenEmails));
      }
    }
    
    this.processing = false;
  }
}

export default new EmailQueue();