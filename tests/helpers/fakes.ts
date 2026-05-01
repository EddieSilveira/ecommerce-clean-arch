import { IHasher } from "@application/ports/hasher";
import { IOrderRepository } from "@application/ports/order.repository";
import { IPaymentRepository } from "@application/ports/payment.repository";
import { IProductRepository } from "@application/ports/product.repository";
import { IUserRepository } from "@application/ports/user.repository";
import { ITokenProvider } from "@application/ports/token-provider";
import { ITokenGenerator } from "@application/ports/token-generator";
import { IEmailNotifier } from "@application/ports/email-notifier";
import { Role } from "@domain/shared/role";
import { Order } from "@domain/order/entities/order.entity";
import { Payment } from "@domain/payment/payment.entity";
import { Product } from "@domain/product/entities/product.entity";
import { User } from "@domain/user/entities/user.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export function fakeUserRepository(users: User[] = []): IUserRepository {
  return {
    findById: async (id: UUID) => users.find(u => u.getId().equals(id)) ?? null,
    findByEmail: async (email: string) => users.find(u => u.getEmail() === email) ?? null,
    findByResetToken: async (token: string) => users.find(u => u.getResetToken() === token) ?? null,
    save: async (user: User) => {
      const index = users.findIndex(u => u.getId().equals(user.getId()));
      if (index !== -1) users[index] = user;
      else users.push(user);
    },
    delete: async (id: UUID) => {
      const index = users.findIndex(u => u.getId().equals(id));
      if (index !== -1) users.splice(index, 1);
    },
  };
}

export function fakeProductRepository(products: Product[] = []): IProductRepository {
  return {
    findById: async (id: UUID) => products.find(p => p.getId().equals(id)) ?? null,
    findAll: async () => [...products],
    save: async (product: Product) => {
      const index = products.findIndex(p => p.getId().equals(product.getId()));
      if (index !== -1) products[index] = product;
      else products.push(product);
    },
    delete: async (id: UUID) => {
      const index = products.findIndex(p => p.getId().equals(id));
      if (index !== -1) products.splice(index, 1);
    },
  };
}

export function fakeOrderRepository(orders: Order[] = []): IOrderRepository {
  return {
    findById: async (id: UUID) => orders.find(o => o.getId().equals(id)) ?? null,
    findByUserId: async (userId: UUID) => orders.filter(o => o.getUserId().equals(userId)),
    save: async (order: Order) => {
      const index = orders.findIndex(o => o.getId().equals(order.getId()));
      if (index !== -1) orders[index] = order;
      else orders.push(order);
    },
  };
}

export function fakePaymentRepository(payments: Payment[] = []): IPaymentRepository {
  return {
    findById: async (id: UUID) => payments.find(p => p.getId().equals(id)) ?? null,
    findByOrderId: async (orderId: UUID) => payments.find(p => p.getOrderId().equals(orderId)) ?? null,
    save: async (payment: Payment) => {
      const index = payments.findIndex(p => p.getId().equals(payment.getId()));
      if (index !== -1) payments[index] = payment;
      else payments.push(payment);
    },
  };
}

export function fakeHasher(): IHasher {
  return {
    hash: async (plain: string) => `hashed:${plain}`,
    compare: async (plain: string, hash: string) => hash === `hashed:${plain}`,
  };
}

export function fakeTokenProvider(): ITokenProvider {
  return {
    generate: (userId: string, role: Role) => `token:${userId}:${role}`,
  };
}

export function fakeTokenGenerator(): ITokenGenerator {
  return {
    generate: () => "reset-token-abc123",
  };
}

export function fakeEmailNotifier(): IEmailNotifier & { sentEmails: Array<{ email: string; token: string }> } {
  const sentEmails: Array<{ email: string; token: string }> = [];
  return {
    sentEmails,
    sendPasswordReset: async (email: string, token: string) => {
      sentEmails.push({ email, token });
    },
  };
}
