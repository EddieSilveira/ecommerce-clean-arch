import { CancelOrderUseCase } from "@application/use-cases/order/cancel-order.use-case";
import { fakeOrderRepository } from "@helpers/fakes";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makeOrder = () => Order.create({ userId: UUID.create() });

describe("CancelOrderUseCase", () => {
  it("should cancel a pending order", async () => {
    const order = makeOrder();
    const orders = [order];
    const useCase = new CancelOrderUseCase(fakeOrderRepository(orders));

    await useCase.execute({ orderId: order.getId().getValue() });

    expect(orders[0]!.getStatus()).toBe(OrderStatus.CANCELLED);
  });

  it("should throw if order is not found", async () => {
    const useCase = new CancelOrderUseCase(fakeOrderRepository());

    await expect(
      useCase.execute({ orderId: "00000000-0000-4000-8000-000000000001" })
    ).rejects.toThrow("Order not found");
  });

  it("should throw if order is already cancelled", async () => {
    const order = makeOrder();
    order.cancel();
    const useCase = new CancelOrderUseCase(fakeOrderRepository([order]));

    await expect(
      useCase.execute({ orderId: order.getId().getValue() })
    ).rejects.toThrow("Cannot cancel a cancelled order");
  });
});
