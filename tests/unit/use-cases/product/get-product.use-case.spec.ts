import { GetProductUseCase } from "@application/use-cases/product/get-product.use-case";
import { fakeProductRepository } from "@helpers/fakes";
import { Product } from "@domain/product/entities/product.entity";
import { Money } from "@domain/shared/value-objects/money.vo";

const makeProduct = () => Product.create({ name: "T-Shirt", price: Money.create(50), stock: 10 });

describe("GetProductUseCase", () => {
  it("should return product data by id", async () => {
    const product = makeProduct();
    const useCase = new GetProductUseCase(fakeProductRepository([product]));

    const output = await useCase.execute({ productId: product.getId().getValue() });

    expect(output.id).toBe(product.getId().getValue());
    expect(output.name).toBe("T-Shirt");
    expect(output.price).toBe(50);
    expect(output.stock).toBe(10);
  });

  it("should throw if product is not found", async () => {
    const useCase = new GetProductUseCase(fakeProductRepository());

    await expect(
      useCase.execute({ productId: "00000000-0000-4000-8000-000000000001" })
    ).rejects.toThrow("Product not found");
  });
});
