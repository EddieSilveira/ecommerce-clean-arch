import { FailPaymentUseCase } from "@application/use-cases/payment/fail-payment.use-case";
import { fakeOrderRepository, fakePaymentRepository } from "@helpers/fakes";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { Payment, PaymentStatus } from "@domain/payment/payment.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makePendingOrder = () => Order.create({ userId: UUID.create() });
const makePaymentFor = (order: Order) =>
  Payment.create({ orderId: order.getId(), amount: Money.create(100) });

describe("FailPaymentUseCase", () => {
  it("should fail payment and cancel order", async () => {
    const order = makePendingOrder();
    const payment = makePaymentFor(order);
    const orders = [order];
    const payments = [payment];

    const useCase = new FailPaymentUseCase(fakePaymentRepository(payments), fakeOrderRepository(orders));

    await useCase.execute({ paymentId: payment.getId().getValue() });

    expect(payments[0]!.getStatus()).toBe(PaymentStatus.FAILED);
    expect(orders[0]!.getStatus()).toBe(OrderStatus.CANCELLED);
  });

  it("should throw if payment is not found", async () => {
    const useCase = new FailPaymentUseCase(fakePaymentRepository(), fakeOrderRepository());

    await expect(
      useCase.execute({ paymentId: "00000000-0000-4000-8000-000000000001" })
    ).rejects.toThrow("Payment not found");
  });

  it("should throw if order is not found", async () => {
    const order = makePendingOrder();
    const payment = makePaymentFor(order);

    const useCase = new FailPaymentUseCase(fakePaymentRepository([payment]), fakeOrderRepository());

    await expect(
      useCase.execute({ paymentId: payment.getId().getValue() })
    ).rejects.toThrow("Order not found");
  });

  it("should throw if payment is already failed", async () => {
    const order = makePendingOrder();
    const payment = makePaymentFor(order);
    payment.fail();

    const useCase = new FailPaymentUseCase(fakePaymentRepository([payment]), fakeOrderRepository([order]));

    await expect(
      useCase.execute({ paymentId: payment.getId().getValue() })
    ).rejects.toThrow("Only pending payments can be failed");
  });
});
