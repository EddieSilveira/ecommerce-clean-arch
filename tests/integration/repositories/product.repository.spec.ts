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

  describe("findAll with pagination", () => {
    it("returns first page when no cursor given", async () => {
      await makeProduct({ name: "A" });
      await makeProduct({ name: "B" });
      await makeProduct({ name: "C" });

      const result = await repo.findAll({ limit: 2 });

      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).not.toBeNull();
    });

    it("returns second page using cursor", async () => {
      await makeProduct({ name: "A" });
      await makeProduct({ name: "B" });
      await makeProduct({ name: "C" });

      const first = await repo.findAll({ limit: 2 });
      const second = await repo.findAll({ cursor: first.nextCursor!, limit: 2 });

      expect(second.items).toHaveLength(1);
      expect(second.nextCursor).toBeNull();
    });

    it("returns all items when count is less than limit", async () => {
      await makeProduct({ name: "Only" });

      const result = await repo.findAll({ limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.nextCursor).toBeNull();
    });

    it("returns empty when no products exist", async () => {
      const result = await repo.findAll({ limit: 20 });
      expect(result.items).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
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
