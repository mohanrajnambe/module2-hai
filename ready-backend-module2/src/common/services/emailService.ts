import { SESIntegration } from "@/integrations/sesIntegration";

export class EmailService {
  private sesIntegration: SESIntegration;
  private sourceEmail: string;
  private recipientEmails: string[];

  constructor() {
    this.sesIntegration = new SESIntegration();
    this.sourceEmail = process.env.SOURCE_EMAIL || "notifications@ready.presidio.com";
    this.recipientEmails = (process.env.RECIPIENT_EMAILS || "").split(",");
    if (this.recipientEmails.length === 0 || !this.recipientEmails[0]) {
      throw new Error(
        "Recipient emails must be set in the environment variable RECIPIENT_EMAILS"
      );
    }
  }

  public async sendApprovalEmail(
    userName: string = "User",
    bookName: string = "Book"
  ) {
    const emailParams = {
      Source: this.sourceEmail,
      Destination: {
        ToAddresses: this.recipientEmails,
      },
      Message: {
        Subject: {
          Data: "Ready - Book approval request",
        },
        Body: {
          Html: {
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2>Book Approval Request</h2>
                  <p>${userName} has recommended a book named "${bookName}". Please review and approve the request.</p>
                  <a href="https://ready.presidio.com/admin/approvals" 
                     style="display: inline-block; padding: 10px 20px; margin-top: 10px; color: white; text-decoration: none; background-color: #007BFF; border-radius: 5px;">
                    View Book
                  </a>
                </body>
              </html>
            `,
          },
          Text: {
            Data: `User has uploaded a book, and the request is pending. Please visit: https://ready.presidio.com/admin/approvals`,
          },
        },
      },
    };

    const response = await this.sesIntegration.sendEmail(emailParams);

    return response;
  }
}
