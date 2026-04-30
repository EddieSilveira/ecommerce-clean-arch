import { GetOrderUseCase } from "@application/use-cases/order/get-order.use-case";
import { fakeOrderRepository } from "@helpers/fakes";
import { Order } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makeOrder = () => Order.create({ userId: UUID.create() });

describe("GetOrderUseCase", () => {
  it("should return order data by id", async () => {
    const order = makeOrder();
    const useCase = new GetOrderUseCase(fakeOrderRepository([order]));

    const output = await useCase.execute({ orderId: order.getId().getValue() });

    expect(output.id).toBe(order.getId().getValue());
    expect(output.userId).toBe(order.getUserId().getValue());
    expect(output.status).toBe("PENDING");
    expect(output.total).toBe(0);
    expect(output.items).toEqual([]);
  });

  it("should throw if order is not found", async () => {
    const useCase = new GetOrderUseCase(fakeOrderRepository());

    await expect(
      useCase.execute({ orderId: "00000000-0000-4000-8000-000000000001" })
    ).rejects.toThrow("Order not found");
  });
});
