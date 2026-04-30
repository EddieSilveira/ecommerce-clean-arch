import { ProcessPaymentUseCase } from "@application/use-cases/payment/process-payment.use-case";
import { fakeOrderRepository, fakePaymentRepository } from "@helpers/fakes";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { Payment, PaymentStatus } from "@domain/payment/payment.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makePendingOrder = () => Order.create({ userId: UUID.create() });

describe("ProcessPaymentUseCase", () => {
  it("should create a payment in PENDING status for a pending order", async () => {
    const order = makePendingOrder();
    const payments: Payment[] = [];
    const useCase = new ProcessPaymentUseCase(fakeOrderRepository([order]), fakePaymentRepository(payments));

    const output = await useCase.execute({ orderId: order.getId().getValue(), amount: 150 });

    expect(output.paymentId).toBeDefined();
    expect(payments).toHaveLength(1);
    expect(payments[0]!.getStatus()).toBe(PaymentStatus.PENDING);
    expect(payments[0]!.getAmount().getValue()).toBe(150);
  });

  it("should throw if order is not found", async () => {
    const useCase = new ProcessPaymentUseCase(fakeOrderRepository(), fakePaymentRepository());

    await expect(
      useCase.execute({ orderId: "00000000-0000-4000-8000-000000000001", amount: 100 })
    ).rejects.toThrow("Order not found");
  });

  it("should throw if order is not in PENDING status", async () => {
    const order = makePendingOrder();
    order.cancel();
    const useCase = new ProcessPaymentUseCase(fakeOrderRepository([order]), fakePaymentRepository());

    await expect(
      useCase.execute({ orderId: order.getId().getValue(), amount: 100 })
    ).rejects.toThrow("Order is not pending");
  });

  it("should throw if amount is zero or negative", async () => {
    const order = makePendingOrder();
    const useCase = new ProcessPaymentUseCase(fakeOrderRepository([order]), fakePaymentRepository());

    await expect(
      useCase.execute({ orderId: order.getId().getValue(), amount: 0 })
    ).rejects.toThrow("Value cannot be negative");
  });
});
