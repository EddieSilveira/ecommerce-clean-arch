import { prismaTest, clearDatabase } from "../setup/prisma";
import { ProductPrismaRepository } from "@infra/repositories/product.repository";
import { Product } from "@domain/product/entities/product.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const repo = new ProductPrismaRepository(prismaTest);

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await prismaTest.$disconnect();
});

async function makeProduct(overrides?: Partial<{ name: string; price: number; stock: number }>): Promise<Product> {
  const product = Product.create({
    name: overrides?.name ?? "Widget",
    price: Money.create(overrides?.price ?? 9.99),
    stock: overrides?.stock ?? 10,
  });
  await repo.save(product);
  return product;
}

describe("ProductPrismaRepository", () => {
  describe("save + findById", () => {
    it("persists a product and retrieves it by id", async () => {
      const product = await makeProduct({ name: "Gadget", price: 19.99, stock: 5 });

      const found = await repo.findById(product.getId());

      expect(found).not.toBeNull();
      expect(found!.getId().getValue()).toBe(product.getId().getValue());
      expect(found!.getName()).toBe("Gadget");
      expect(found!.getPrice().getValue()).toBe(19.99);
      expect(found!.getStock()).toBe(5);
    });

    it("returns null for unknown id", async () => {
      const result = await repo.findById(UUID.create());
      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("returns all products", async () => {
      await makeProduct({ name: "A" });
      await makeProduct({ name: "B", price: 1.0 });
      await makeProduct({ name: "C", price: 2.0 });

      const all = await repo.findAll();
      expect(all.length).toBe(3);
    });

    it("returns empty array when no products exist", async () => {
      const all = await repo.findAll();
      expect(all).toEqual([]);
    });
  });

  describe("save (update)", () => {
    it("updates an existing product", async () => {
      const product = await makeProduct({ stock: 10 });
      product.update({ stock: 25 });
      await repo.save(product);

      const found = await repo.findById(product.getId());
      expect(found!.getStock()).toBe(25);
    });
  });

  describe("delete", () => {
    it("removes the product", async () => {
      const product = await makeProduct();
      await repo.delete(product.getId());
      const found = await repo.findById(product.getId());
      expect(found).toBeNull();
    });
  });
});
