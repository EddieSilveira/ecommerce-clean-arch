import { PlaceOrderUseCase } from "@application/use-cases/order/place-order.use-case";
import { IOrderRepository } from "@application/ports/order.repository";
import { IProductRepository } from "@application/ports/product.repository";
import { IUserRepository } from "@application/ports/user.repository";
import { Order } from "@domain/order/entities/order.entity";
import { Product } from "@domain/product/entities/product.entity";
import { User } from "@domain/user/entities/user.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makeUser = () => User.create({ name: "John Doe", email: "john@example.com", passwordHash: "hashed_password_123" });
const makeProduct = (stock = 10) =>
  Product.create({ name: "T-Shirt", price: Money.create(50), stock });

function makeRepositories(user: User, product: Product) {
  const savedOrders: Order[] = [];
  const savedProducts: Product[] = [];

  const userRepository: IUserRepository = {
    findById: async (id: UUID) =>
      user.getId().equals(id) ? user : null,
    save: async () => {},
  };

  const productRepository: IProductRepository = {
    findById: async (id: UUID) =>
      product.getId().equals(id) ? product : null,
    save: async (p: Product) => { savedProducts.push(p); },
  };

  const orderRepository: IOrderRepository = {
    save: async (order: Order) => { savedOrders.push(order); },
    findById: async () => null,
    findByUserId: async () => [],
  };

  return { userRepository, productRepository, orderRepository, savedOrders, savedProducts };
}

describe("PlaceOrderUseCase", () => {
  it("should place an order in PENDING status and decrease product stock", async () => {
    const user = makeUser();
    const product = makeProduct(10);
    const { userRepository, productRepository, orderRepository, savedOrders } =
      makeRepositories(user, product);

    const useCase = new PlaceOrderUseCase(userRepository, productRepository, orderRepository);

    const output = await useCase.execute({
      userId: user.getId().getValue(),
      items: [{ productId: product.getId().getValue(), quantity: 2 }],
    });

    expect(output.orderId).toBeDefined();
    expect(output.total).toBe(100); // 50 * 2
    expect(product.getStock()).toBe(8); // 10 - 2
    expect(savedOrders).toHaveLength(1);
    expect(savedOrders[0]!.getStatus()).toBe("PENDING");
  });

  it("should throw if user is not found", async () => {
    const user = makeUser();
    const product = makeProduct();
    const { productRepository, orderRepository } = makeRepositories(user, product);

    const emptyUserRepository: IUserRepository = {
      findById: async () => null,
      save: async () => {},
    };

    const useCase = new PlaceOrderUseCase(emptyUserRepository, productRepository, orderRepository);

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        items: [{ productId: product.getId().getValue(), quantity: 1 }],
      })
    ).rejects.toThrow("User not found");
  });

  it("should throw if product is not found", async () => {
    const user = makeUser();
    const product = makeProduct();
    const { userRepository, orderRepository } = makeRepositories(user, product);

    const emptyProductRepository: IProductRepository = {
      findById: async () => null,
      save: async () => {},
    };

    const useCase = new PlaceOrderUseCase(userRepository, emptyProductRepository, orderRepository);

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        items: [{ productId: product.getId().getValue(), quantity: 1 }],
      })
    ).rejects.toThrow("not found");
  });

  it("should throw if product is out of stock", async () => {
    const user = makeUser();
    const product = makeProduct(0);
    const { userRepository, productRepository, orderRepository } = makeRepositories(user, product);

    const useCase = new PlaceOrderUseCase(userRepository, productRepository, orderRepository);

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
    const { userRepository, productRepository, orderRepository } = makeRepositories(user, product);

    const useCase = new PlaceOrderUseCase(userRepository, productRepository, orderRepository);

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        items: [{ productId: product.getId().getValue(), quantity: 5 }],
      })
    ).rejects.toThrow("Insufficient stock");
  });
});
