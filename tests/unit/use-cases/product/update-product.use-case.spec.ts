import { UpdateProductUseCase } from "@application/use-cases/product/update-product.use-case";
import { Product } from "@domain/product/entities/product.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { fakeProductRepository } from "@helpers/fakes";

const adminActor = { id: 'admin-id', role: 'ADMIN' as const };
const makeProduct = () => Product.create({ name: "T-shirt", price: Money.create(6990), stock: 50 });

describe("UpdateProductUseCase", () => {
  it("should update the product name", async () => {
    const product = makeProduct();
    const useCase = new UpdateProductUseCase(fakeProductRepository([product]));

    await useCase.execute({ productId: product.getId().getValue(), name: "Short", actor: adminActor });

    expect(product.getName()).toBe("Short");
  });

  it("should update the product stock", async () => {
    const product = makeProduct();
    const useCase = new UpdateProductUseCase(fakeProductRepository([product]));

    await useCase.execute({ productId: product.getId().getValue(), stock: 100, actor: adminActor });

    expect(product.getStock()).toBe(100);
  });

  it("should update the product price", async () => {
    const product = makeProduct();
    const useCase = new UpdateProductUseCase(fakeProductRepository([product]));

    await useCase.execute({ productId: product.getId().getValue(), price: 14999, actor: adminActor });

    expect(product.getPrice().getValue()).toBe(14999);
  });

  it("should update multiple fields at once", async () => {
    const product = makeProduct();
    const useCase = new UpdateProductUseCase(fakeProductRepository([product]));

    await useCase.execute({ productId: product.getId().getValue(), name: "Short", price: 14999, stock: 35, actor: adminActor });

    expect(product.getName()).toBe("Short");
    expect(product.getPrice().getValue()).toBe(14999);
    expect(product.getStock()).toBe(35);
  });

  it("should throw if product is not found", async () => {
    const product = makeProduct();
    const useCase = new UpdateProductUseCase(fakeProductRepository([]));

    await expect(useCase.execute({ productId: product.getId().getValue(), actor: adminActor })).rejects.toThrow("Product not found");
  });

  it("should return the productId", async () => {
    const product = makeProduct();
    const useCase = new UpdateProductUseCase(fakeProductRepository([product]));

    const output = await useCase.execute({ productId: product.getId().getValue(), name: "Short", actor: adminActor });

    expect(output.productId).toBe(product.getId().getValue());
  });

  it("should not change fields that are not provided", async () => {
    const product = makeProduct();
    const useCase = new UpdateProductUseCase(fakeProductRepository([product]));

    await useCase.execute({ productId: product.getId().getValue(), actor: adminActor });

    expect(product.getName()).toBe("T-shirt");
    expect(product.getPrice().getValue()).toBe(6990);
    expect(product.getStock()).toBe(50);
  });

  it("should trim the product name", async () => {
    const product = makeProduct();
    const useCase = new UpdateProductUseCase(fakeProductRepository([product]));

    await useCase.execute({ productId: product.getId().getValue(), name: "  Short  ", actor: adminActor });

    expect(product.getName()).toBe("Short");
  });

  it("should throw if name is empty", async () => {
    const product = makeProduct();
    const useCase = new UpdateProductUseCase(fakeProductRepository([product]));

    await expect(useCase.execute({ productId: product.getId().getValue(), name: "   ", actor: adminActor })).rejects.toThrow("Product name cannot be empty");
  });

  it("should throw if stock is negative", async () => {
    const product = makeProduct();
    const useCase = new UpdateProductUseCase(fakeProductRepository([product]));

    await expect(useCase.execute({ productId: product.getId().getValue(), stock: -1, actor: adminActor })).rejects.toThrow("Product stock cannot be negative");
  });

  it("should throw if price is negative", async () => {
    const product = makeProduct();
    const useCase = new UpdateProductUseCase(fakeProductRepository([product]));

    await expect(useCase.execute({ productId: product.getId().getValue(), price: -1, actor: adminActor })).rejects.toThrow("Value cannot be negative");
  });

  it("should throw Forbidden when actor is not ADMIN", async () => {
    const product = makeProduct();
    const useCase = new UpdateProductUseCase(fakeProductRepository([product]));

    await expect(
      useCase.execute({ productId: product.getId().getValue(), name: "Hacked", actor: { id: 'user-id', role: 'CUSTOMER' } })
    ).rejects.toThrow("Forbidden");
  });
});
