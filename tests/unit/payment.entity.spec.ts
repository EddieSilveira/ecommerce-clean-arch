import { Payment, PaymentStatus } from "../../apps/api/src/domain/payment/payment.entity";
import { Money } from "../../apps/api/src/domain/shared/value-objects/money.vo";
import { UUID } from "../../apps/api/src/domain/shared/value-objects/uuid.vo";

describe("Payment", () => {
  const validProps = () => ({
    orderId: UUID.create(),
    amount: Money.create(199.8),
  });

  describe("create", () => {
    it("should create a payment with pending status", () => {
      const payment = Payment.create(validProps());
      expect(payment.getStatus()).toBe(PaymentStatus.PENDING);
    });

    it("should create a payment with correct amount", () => {
      const payment = Payment.create(validProps());
      expect(payment.getAmount().getValue()).toBe(199.8);
    });

    it("should generate an id automatically", () => {
      const payment = Payment.create(validProps());
      expect(payment.getId()).toBeDefined();
    });

    it("should throw when orderId is invalid", () => {
      expect(() => UUID.create("")).toThrow("Invalid UUID");
    });

    it("should throw when amount is zero", () => {
      expect(() => Payment.create({ ...validProps(), amount: Money.create(0) })).toThrow(
        "Value cannot be negative"
      );
    });
  });

  describe("approve", () => {
    it("should approve a pending payment", () => {
      const payment = Payment.create(validProps());
      payment.approve();
      expect(payment.getStatus()).toBe(PaymentStatus.PAID);
    });

    it("should throw when approving an already paid payment", () => {
      const payment = Payment.create(validProps());
      payment.approve();
      expect(() => payment.approve()).toThrow("Only pending payments can be approved");
    });

    it("should throw when approving a failed payment", () => {
      const payment = Payment.create(validProps());
      payment.fail();
      expect(() => payment.approve()).toThrow("Only pending payments can be approved");
    });
  });

  describe("fail", () => {
    it("should fail a pending payment", () => {
      const payment = Payment.create(validProps());
      payment.fail();
      expect(payment.getStatus()).toBe(PaymentStatus.FAILED);
    });

    it("should throw when failing an already paid payment", () => {
      const payment = Payment.create(validProps());
      payment.approve();
      expect(() => payment.fail()).toThrow("Only pending payments can be failed");
    });

    it("should throw when failing an already failed payment", () => {
      const payment = Payment.create(validProps());
      payment.fail();
      expect(() => payment.fail()).toThrow("Only pending payments can be failed");
    });
  });

  describe("isPaid", () => {
    it("should return true when payment is paid", () => {
      const payment = Payment.create(validProps());
      payment.approve();
      expect(payment.isPaid()).toBe(true);
    });

    it("should return false when payment is pending", () => {
      const payment = Payment.create(validProps());
      expect(payment.isPaid()).toBe(false);
    });

    it("should return false when payment failed", () => {
      const payment = Payment.create(validProps());
      payment.fail();
      expect(payment.isPaid()).toBe(false);
    });
  });
});
