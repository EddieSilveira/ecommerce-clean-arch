import { IHasher } from "@application/ports/hasher";
import { IOrderRepository } from "@application/ports/order.repository";
import { IProductRepository } from "@application/ports/product.repository";
import { IUserRepository } from "@application/ports/user.repository";
import { Order } from "@domain/order/entities/order.entity";
import { Product } from "@domain/product/entities/product.entity";
import { User } from "@domain/user/entities/user.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export function fakeUserRepository(users: User[] = []): IUserRepository {
  return {
    findById: async (id: UUID) => users.find(u => u.getId().equals(id)) ?? null,
    findByEmail: async (email: string) => users.find(u => u.getEmail() === email) ?? null,
    save: async (user: User) => { users.push(user); },
    delete: async (id: UUID) => {
      const index = users.findIndex(u => u.getId().equals(id));
      if (index !== -1) users.splice(index, 1);
    },
  };
}

export function fakeProductRepository(products: Product[] = []): IProductRepository {
  return {
    findById: async (id: UUID) => products.find(p => p.getId().equals(id)) ?? null,
    save: async (product: Product) => { products.push(product); },
  };
}

export function fakeOrderRepository(orders: Order[] = []): IOrderRepository {
  return {
    findById: async (id: UUID) => orders.find(o => o.getId().equals(id)) ?? null,
    save: async (order: Order) => { orders.push(order); },
  };
}

export function fakeHasher(): IHasher {
  return {
    hash: async (plain: string) => `hashed:${plain}`,
    compare: async (plain: string, hash: string) => hash === `hashed:${plain}`,
  };
}
