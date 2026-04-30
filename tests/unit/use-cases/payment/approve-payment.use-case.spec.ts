import { ApprovePaymentUseCase } from "@application/use-cases/payment/approve-payment.use-case";
import { fakeOrderRepository, fakePaymentRepository } from "@helpers/fakes";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { Payment, PaymentStatus } from "@domain/payment/payment.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makePendingOrderWithItem = () => {
  const order = Order.create({ userId: UUID.create() });
  order.addItem({
    productId: UUID.create(),
    productName: "T-Shirt",
    unitPrice: Money.create(100),
    quantity: 1,
  });
  return order;
};

const makePaymentFor = (order: Order) =>
  Payment.create({ orderId: order.getId(), amount: Money.create(100) });

describe("ApprovePaymentUseCase", () => {
  it("should approve payment and confirm order", async () => {
    const order = makePendingOrderWithItem();
    const payment = makePaymentFor(order);
    const orders = [order];
    const payments = [payment];

    const useCase = new ApprovePaymentUseCase(fakePaymentRepository(payments), fakeOrderRepository(orders));

    await useCase.execute({ paymentId: payment.getId().getValue() });

    expect(payments[0]!.getStatus()).toBe(PaymentStatus.PAID);
    expect(orders[0]!.getStatus()).toBe(OrderStatus.CONFIRMED);
  });

  it("should throw if payment is not found", async () => {
    const useCase = new ApprovePaymentUseCase(fakePaymentRepository(), fakeOrderRepository());

    await expect(
      useCase.execute({ paymentId: "00000000-0000-4000-8000-000000000001" })
    ).rejects.toThrow("Payment not found");
  });

  it("should throw if order is not found", async () => {
    const order = makePendingOrderWithItem();
    const payment = makePaymentFor(order);

    const useCase = new ApprovePaymentUseCase(fakePaymentRepository([payment]), fakeOrderRepository());

    await expect(
      useCase.execute({ paymentId: payment.getId().getValue() })
    ).rejects.toThrow("Order not found");
  });

  it("should throw if payment is already approved", async () => {
    const order = makePendingOrderWithItem();
    const payment = makePaymentFor(order);
    payment.approve();

    const useCase = new ApprovePaymentUseCase(fakePaymentRepository([payment]), fakeOrderRepository([order]));

    await expect(
      useCase.execute({ paymentId: payment.getId().getValue() })
    ).rejects.toThrow("Only pending payments can be approved");
  });
});
