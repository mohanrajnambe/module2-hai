import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export class SESIntegration {

  private sesClient: SESClient;
  constructor() {
    this.sesClient = new SESClient({});
  }
  
  public async sendEmail(params: any) {
    const command = new SendEmailCommand(params);
    try {
      const response = await this.sesClient.send(command);
      console.log("Email sent successfully:", response);
      return response;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}
