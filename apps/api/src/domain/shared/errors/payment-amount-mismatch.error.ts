export class PaymentAmountMismatchError extends Error {
  constructor() {
    super('Payment amount does not match order total');
    this.name = 'PaymentAmountMismatchError';
  }
}
