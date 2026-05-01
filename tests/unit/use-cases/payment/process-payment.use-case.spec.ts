import { ProcessPaymentUseCase } from "@application/use-cases/payment/process-payment.use-case";
import { fakeOrderRepository, fakePaymentRepository } from "@helpers/fakes";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { Payment, PaymentStatus } from "@domain/payment/payment.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const ownerId = UUID.create();
const makePendingOrder = () => Order.create({ userId: ownerId });
const ownerActor = () => ({ id: ownerId.getValue(), role: 'CUSTOMER' as const });

describe("ProcessPaymentUseCase", () => {
  it("should create a payment in PENDING status for a pending order", async () => {
    const order = makePendingOrder();
    const payments: Payment[] = [];
    const useCase = new ProcessPaymentUseCase(fakeOrderRepository([order]), fakePaymentRepository(payments));

    const output = await useCase.execute({ orderId: order.getId().getValue(), amount: 150, actor: ownerActor() });

    expect(output.paymentId).toBeDefined();
    expect(payments).toHaveLength(1);
    expect(payments[0]!.getStatus()).toBe(PaymentStatus.PENDING);
    expect(payments[0]!.getAmount().getValue()).toBe(150);
  });

  it("should throw if order is not found", async () => {
    const useCase = new ProcessPaymentUseCase(fakeOrderRepository(), fakePaymentRepository());

    await expect(
      useCase.execute({ orderId: "00000000-0000-4000-8000-000000000001", amount: 100, actor: ownerActor() })
    ).rejects.toThrow("Order not found");
  });

  it("should throw if order is not in PENDING status", async () => {
    const order = makePendingOrder();
    order.cancel();
    const useCase = new ProcessPaymentUseCase(fakeOrderRepository([order]), fakePaymentRepository());

    await expect(
      useCase.execute({ orderId: order.getId().getValue(), amount: 100, actor: ownerActor() })
    ).rejects.toThrow("Order is not pending");
  });

  it("should throw if amount is zero or negative", async () => {
    const order = makePendingOrder();
    const useCase = new ProcessPaymentUseCase(fakeOrderRepository([order]), fakePaymentRepository());

    await expect(
      useCase.execute({ orderId: order.getId().getValue(), amount: 0, actor: ownerActor() })
    ).rejects.toThrow("Value cannot be negative");
  });

  it("should throw Unauthorized when actor does not own the order", async () => {
    const order = makePendingOrder();
    const useCase = new ProcessPaymentUseCase(fakeOrderRepository([order]), fakePaymentRepository());

    await expect(
      useCase.execute({
        orderId: order.getId().getValue(),
        amount: 150,
        actor: { id: 'different-user-id', role: 'CUSTOMER' },
      })
    ).rejects.toThrow("Unauthorized");
  });
});
