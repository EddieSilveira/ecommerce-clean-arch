import { ListOrdersUseCase } from "@application/use-cases/order/list-orders.use-case";
import { fakeOrderRepository } from "@helpers/fakes";
import { Order } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

describe("ListOrdersUseCase", () => {
  it("should return all orders for a user", async () => {
    const userId = UUID.create();
    const order1 = Order.create({ userId });
    const order2 = Order.create({ userId });
    const otherOrder = Order.create({ userId: UUID.create() });

    const useCase = new ListOrdersUseCase(fakeOrderRepository([order1, order2, otherOrder]));

    const output = await useCase.execute({ userId: userId.getValue() });

    expect(output).toHaveLength(2);
    expect(output[0]!.id).toBe(order1.getId().getValue());
    expect(output[1]!.id).toBe(order2.getId().getValue());
  });

  it("should return empty array when user has no orders", async () => {
    const useCase = new ListOrdersUseCase(fakeOrderRepository());

    const output = await useCase.execute({ userId: "00000000-0000-4000-8000-000000000001" });

    expect(output).toEqual([]);
  });
});
