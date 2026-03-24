export interface IEmailNotifier {
  sendPasswordReset(email: string, token: string): Promise<void>;
}
