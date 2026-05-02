import { GetOrderUseCase } from "@application/use-cases/order/get-order.use-case";
import { fakeOrderRepository } from "@helpers/fakes";
import { Order } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makeOrder = () => {
  const userId = UUID.create();
  return { order: Order.create({ userId }), userId };
};

describe("GetOrderUseCase", () => {
  it("should return order data when actor is the owner", async () => {
    const { order, userId } = makeOrder();
    const useCase = new GetOrderUseCase(fakeOrderRepository([order]));

    const output = await useCase.execute({
      orderId: order.getId().getValue(),
      actor: { id: userId.getValue(), role: 'CUSTOMER' },
    });

    expect(output.id).toBe(order.getId().getValue());
    expect(output.userId).toBe(userId.getValue());
    expect(output.status).toBe("PENDING");
    expect(output.total).toBe(0);
    expect(output.items).toEqual([]);
  });

  it("should throw if order is not found", async () => {
    const useCase = new GetOrderUseCase(fakeOrderRepository());

    await expect(
      useCase.execute({ orderId: "00000000-0000-4000-8000-000000000001", actor: { id: "00000000-0000-4000-8000-000000000001", role: 'CUSTOMER' } })
    ).rejects.toThrow("Order not found");
  });

  it("should throw ForbiddenError when actor does not own the order", async () => {
    const { order } = makeOrder();
    const useCase = new GetOrderUseCase(fakeOrderRepository([order]));

    await expect(
      useCase.execute({
        orderId: order.getId().getValue(),
        actor: { id: 'other-user-id', role: 'CUSTOMER' },
      })
    ).rejects.toMatchObject({ name: 'ForbiddenError' });
  });
});
