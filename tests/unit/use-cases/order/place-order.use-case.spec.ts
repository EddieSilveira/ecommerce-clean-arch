import { PlaceOrderUseCase } from "@application/use-cases/order/place-order.use-case";
import { fakeOrderRepository, fakeProductRepository, fakeUserRepository } from "@helpers/fakes";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { Product } from "@domain/product/entities/product.entity";
import { User } from "@domain/user/entities/user.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makeUser = () => User.create({ name: "John Doe", email: "john@example.com", passwordHash: "hashed_password_123" });
const makeProduct = (stock = 10) => Product.create({ name: "T-Shirt", price: Money.create(50), stock });

describe("PlaceOrderUseCase", () => {
  it("should place an order in PENDING status and decrease product stock", async () => {
    const user = makeUser();
    const product = makeProduct(10);
    const orders: Order[] = [];

    const useCase = new PlaceOrderUseCase(
      fakeUserRepository([user]),
      fakeProductRepository([product]),
      fakeOrderRepository(orders)
    );

    const output = await useCase.execute({
      userId: user.getId().getValue(),
      items: [{ productId: product.getId().getValue(), quantity: 2 }],
    });

    expect(output.id).toBeDefined();
    expect(output.userId).toBe(user.getId().getValue());
    expect(output.status).toBe(OrderStatus.PENDING);
    expect(output.total).toBe(100);
    expect(output.items).toHaveLength(1);
    expect(output.items[0]).toMatchObject({ productId: product.getId().getValue(), quantity: 2 });
    expect(output).not.toHaveProperty('orderId');
    expect(product.getStock()).toBe(8);
    expect(orders).toHaveLength(1);
  });

  it("should throw if user is not found", async () => {
    const product = makeProduct();
    const useCase = new PlaceOrderUseCase(
      fakeUserRepository(),
      fakeProductRepository([product]),
      fakeOrderRepository()
    );

    await expect(
      useCase.execute({
        userId: UUID.create().getValue(),
        items: [{ productId: product.getId().getValue(), quantity: 1 }],
      })
    ).rejects.toThrow("User not found");
  });

  it("should throw if product is not found", async () => {
    const user = makeUser();
    const useCase = new PlaceOrderUseCase(
      fakeUserRepository([user]),
      fakeProductRepository(),
      fakeOrderRepository()
    );

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        items: [{ productId: UUID.create().getValue(), quantity: 1 }],
      })
    ).rejects.toThrow("not found");
  });

  it("should throw if product is out of stock", async () => {
    const user = makeUser();
    const product = makeProduct(0);
    const useCase = new PlaceOrderUseCase(
      fakeUserRepository([user]),
      fakeProductRepository([product]),
      fakeOrderRepository()
    );

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        items: [{ productId: product.getId().getValue(), quantity: 1 }],
      })
    ).rejects.toThrow("out of stock");
  });

  it("should throw if quantity exceeds stock", async () => {
    const user = makeUser();
    const product = makeProduct(1);
    const useCase = new PlaceOrderUseCase(
      fakeUserRepository([user]),
      fakeProductRepository([product]),
      fakeOrderRepository()
    );

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        items: [{ productId: product.getId().getValue(), quantity: 5 }],
      })
    ).rejects.toThrow("Insufficient stock");
  });
});
