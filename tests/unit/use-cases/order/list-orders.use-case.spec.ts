import { ListOrdersUseCase } from "@application/use-cases/order/list-orders.use-case";
import { fakeOrderRepository } from "@helpers/fakes";
import { Order } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const userId = UUID.create();
const makeOrder = () => Order.create({ userId });

describe("ListOrdersUseCase", () => {
  it("should return orders for the given user", async () => {
    const orders = [makeOrder(), makeOrder()];
    const useCase = new ListOrdersUseCase(fakeOrderRepository(orders));

    const output = await useCase.execute({ userId: userId.getValue(), limit: 20 });

    expect(output.orders).toHaveLength(2);
    expect(output.nextCursor).toBeNull();
  });

  it("should not return orders from other users", async () => {
    const otherId = UUID.create();
    const orders = [Order.create({ userId: otherId })];
    const useCase = new ListOrdersUseCase(fakeOrderRepository(orders));

    const output = await useCase.execute({ userId: userId.getValue(), limit: 20 });

    expect(output.orders).toHaveLength(0);
  });

  it("should return nextCursor when more orders exist", async () => {
    const orders = [makeOrder(), makeOrder(), makeOrder()];
    const useCase = new ListOrdersUseCase(fakeOrderRepository(orders));

    const output = await useCase.execute({ userId: userId.getValue(), limit: 2 });

    expect(output.orders).toHaveLength(2);
    expect(output.nextCursor).not.toBeNull();
  });

  it("should return second page using cursor", async () => {
    const orders = [makeOrder(), makeOrder(), makeOrder()];
    const useCase = new ListOrdersUseCase(fakeOrderRepository(orders));

    const firstPage = await useCase.execute({ userId: userId.getValue(), limit: 2 });
    const secondPage = await useCase.execute({ userId: userId.getValue(), cursor: firstPage.nextCursor!, limit: 2 });

    expect(secondPage.orders).toHaveLength(1);
    expect(secondPage.nextCursor).toBeNull();
  });
});
