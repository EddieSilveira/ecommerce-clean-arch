import { prismaTest, clearDatabase } from "../setup/prisma";
import { UserPrismaRepository } from "@infra/repositories/user.repository";
import { ProductPrismaRepository } from "@infra/repositories/product.repository";
import { OrderPrismaRepository } from "@infra/repositories/order.repository";
import { PaymentPrismaRepository } from "@infra/repositories/payment.repository";
import { User } from "@domain/user/entities/user.entity";
import { Product } from "@domain/product/entities/product.entity";
import { Order } from "@domain/order/entities/order.entity";
import { Payment, PaymentStatus } from "@domain/payment/payment.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const userRepo = new UserPrismaRepository(prismaTest);
const productRepo = new ProductPrismaRepository(prismaTest);
const orderRepo = new OrderPrismaRepository(prismaTest);
const paymentRepo = new PaymentPrismaRepository(prismaTest);

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await prismaTest.$disconnect();
});

async function makeConfirmedOrder(): Promise<Order> {
  const user = User.create({ name: "Bob", email: "bob@example.com", passwordHash: "hash" });
  await userRepo.save(user);
  const product = Product.create({ name: "Item", price: Money.create(50), stock: 10 });
  await productRepo.save(product);
  const order = Order.create({ userId: user.getId() });
  order.addItem({ productId: product.getId(), productName: product.getName(), unitPrice: product.getPrice(), quantity: 1 });
  order.confirm();
  await orderRepo.save(order);
  return order;
}

async function makePayment(order: Order): Promise<Payment> {
  const payment = Payment.create({ orderId: order.getId(), amount: order.getTotal() });
  await paymentRepo.save(payment);
  return payment;
}

describe("PaymentPrismaRepository", () => {
  describe("save + findById", () => {
    it("persists a payment and retrieves it", async () => {
      const order = await makeConfirmedOrder();
      const payment = await makePayment(order);

      const found = await paymentRepo.findById(payment.getId());

      expect(found).not.toBeNull();
      expect(found!.getId().getValue()).toBe(payment.getId().getValue());
      expect(found!.getStatus()).toBe(PaymentStatus.PENDING);
      expect(found!.getAmount().getValue()).toBe(50);
    });

    it("returns null for unknown id", async () => {
      const result = await paymentRepo.findById(UUID.create());
      expect(result).toBeNull();
    });
  });

  describe("findByOrderId", () => {
    it("finds payment by order id", async () => {
      const order = await makeConfirmedOrder();
      const payment = await makePayment(order);

      const found = await paymentRepo.findByOrderId(order.getId());
      expect(found!.getId().getValue()).toBe(payment.getId().getValue());
    });

    it("returns null when no payment exists for order", async () => {
      const result = await paymentRepo.findByOrderId(UUID.create());
      expect(result).toBeNull();
    });
  });

  describe("save (update status)", () => {
    it("updates payment status to PAID", async () => {
      const order = await makeConfirmedOrder();
      const payment = await makePayment(order);
      payment.approve();
      await paymentRepo.save(payment);

      const found = await paymentRepo.findById(payment.getId());
      expect(found!.getStatus()).toBe(PaymentStatus.PAID);
    });

    it("updates payment status to FAILED", async () => {
      const order = await makeConfirmedOrder();
      const payment = await makePayment(order);
      payment.fail();
      await paymentRepo.save(payment);

      const found = await paymentRepo.findById(payment.getId());
      expect(found!.getStatus()).toBe(PaymentStatus.FAILED);
    });
  });
});
