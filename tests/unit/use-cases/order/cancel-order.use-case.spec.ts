import { CancelOrderUseCase } from "@application/use-cases/order/cancel-order.use-case";
import { fakeOrderRepository, fakeProductRepository } from "@helpers/fakes";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { Product } from "@domain/product/entities/product.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makeOrder = () => {
  const userId = UUID.create();
  const order = Order.create({ userId });
  const actor = { id: userId.getValue(), role: 'CUSTOMER' as const };
  return { order, actor, userId };
};

describe("CancelOrderUseCase", () => {
  it("should cancel a pending order", async () => {
    const { order, actor } = makeOrder();
    const orders = [order];
    const useCase = new CancelOrderUseCase(fakeOrderRepository(orders), fakeProductRepository());

    await useCase.execute({ orderId: order.getId().getValue(), actor });

    expect(orders[0]!.getStatus()).toBe(OrderStatus.CANCELLED);
  });

  it("should throw if order is not found", async () => {
    const useCase = new CancelOrderUseCase(fakeOrderRepository(), fakeProductRepository());

    await expect(
      useCase.execute({ orderId: "00000000-0000-4000-8000-000000000001", actor: { id: "some-id", role: 'CUSTOMER' } })
    ).rejects.toThrow("Order not found");
  });

  it("should throw if order is already cancelled", async () => {
    const { order, actor } = makeOrder();
    order.cancel();
    const useCase = new CancelOrderUseCase(fakeOrderRepository([order]), fakeProductRepository());

    await expect(
      useCase.execute({ orderId: order.getId().getValue(), actor })
    ).rejects.toThrow("Cannot cancel a cancelled order");
  });

  it("should throw Forbidden when actor does not own the order", async () => {
    const { order } = makeOrder();
    const useCase = new CancelOrderUseCase(fakeOrderRepository([order]), fakeProductRepository());

    await expect(
      useCase.execute({
        orderId: order.getId().getValue(),
        actor: { id: 'different-id', role: 'CUSTOMER' },
      })
    ).rejects.toThrow("Forbidden");
  });

  it("should restore product stock when order is cancelled", async () => {
    const { order, actor } = makeOrder();
    const product = Product.create({ name: 'Laptop', price: Money.create(100), stock: 10 });
    order.addItem({
      productId: product.getId(),
      productName: product.getName(),
      unitPrice: product.getPrice(),
      quantity: 3,
    });

    const products = [product];
    const useCase = new CancelOrderUseCase(fakeOrderRepository([order]), fakeProductRepository(products));

    await useCase.execute({ orderId: order.getId().getValue(), actor });

    expect(products[0]!.getStock()).toBe(13); // 10 + 3 restored
  });

  it("should restore stock for multiple products when order is cancelled", async () => {
    const { order, actor } = makeOrder();
    const productA = Product.create({ name: 'A', price: Money.create(10), stock: 5 });
    const productB = Product.create({ name: 'B', price: Money.create(20), stock: 2 });
    order.addItem({ productId: productA.getId(), productName: 'A', unitPrice: Money.create(10), quantity: 2 });
    order.addItem({ productId: productB.getId(), productName: 'B', unitPrice: Money.create(20), quantity: 1 });

    const products = [productA, productB];
    const useCase = new CancelOrderUseCase(fakeOrderRepository([order]), fakeProductRepository(products));

    await useCase.execute({ orderId: order.getId().getValue(), actor });

    expect(products[0]!.getStock()).toBe(7);  // 5 + 2
    expect(products[1]!.getStock()).toBe(3);  // 2 + 1
  });
});
