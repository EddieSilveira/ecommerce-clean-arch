import { prismaTest, clearDatabase } from "../setup/prisma";
import { UserPrismaRepository } from "@infra/repositories/user.repository";
import { ProductPrismaRepository } from "@infra/repositories/product.repository";
import { OrderPrismaRepository } from "@infra/repositories/order.repository";
import { User } from "@domain/user/entities/user.entity";
import { Product } from "@domain/product/entities/product.entity";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const userRepo = new UserPrismaRepository(prismaTest);
const productRepo = new ProductPrismaRepository(prismaTest);
const orderRepo = new OrderPrismaRepository(prismaTest);

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await prismaTest.$disconnect();
});

async function makeUser(): Promise<User> {
  const user = User.create({ name: "Alice", email: "alice@example.com", passwordHash: "hash" });
  await userRepo.save(user);
  return user;
}

async function makeProduct(name = "Widget", price = 10, stock = 100): Promise<Product> {
  const product = Product.create({ name, price: Money.create(price), stock });
  await productRepo.save(product);
  return product;
}

async function makeOrder(user: User, product: Product): Promise<Order> {
  const order = Order.create({ userId: user.getId() });
  order.addItem({
    productId: product.getId(),
    productName: product.getName(),
    unitPrice: product.getPrice(),
    quantity: 2,
  });
  order.confirm();
  await orderRepo.save(order);
  return order;
}

describe("OrderPrismaRepository", () => {
  describe("save + findById", () => {
    it("persists an order with items and retrieves it", async () => {
      const user = await makeUser();
      const product = await makeProduct();
      const order = await makeOrder(user, product);

      const found = await orderRepo.findById(order.getId());

      expect(found).not.toBeNull();
      expect(found!.getId().getValue()).toBe(order.getId().getValue());
      expect(found!.getStatus()).toBe(OrderStatus.CONFIRMED);
      expect(found!.getItems()).toHaveLength(1);
      expect(found!.getItems()[0]!.getQuantity()).toBe(2);
      expect(found!.getTotal().getValue()).toBe(20);
    });

    it("returns null for unknown id", async () => {
      const result = await orderRepo.findById(UUID.create());
      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("returns all orders for a user", async () => {
      const user = await makeUser();
      const product = await makeProduct();
      await makeOrder(user, product);
      await makeOrder(user, product);

      const orders = await orderRepo.findByUserId(user.getId());
      expect(orders).toHaveLength(2);
    });

    it("returns empty array for user with no orders", async () => {
      const user = await makeUser();
      const orders = await orderRepo.findByUserId(user.getId());
      expect(orders).toEqual([]);
    });
  });

  describe("save (update)", () => {
    it("updates order status", async () => {
      const user = await makeUser();
      const product = await makeProduct();

      // Create a PENDING order (not confirmed) so it can be cancelled
      const order = Order.create({ userId: user.getId() });
      order.addItem({
        productId: product.getId(),
        productName: product.getName(),
        unitPrice: product.getPrice(),
        quantity: 1,
      });
      await orderRepo.save(order);

      order.cancel();
      await orderRepo.save(order);

      const found = await orderRepo.findById(order.getId());
      expect(found!.getStatus()).toBe(OrderStatus.CANCELLED);
    });
  });
});
