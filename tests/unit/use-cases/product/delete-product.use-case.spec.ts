


import { DeleteProductUseCase } from "@application/use-cases/product/delete-product.use-case";
import { Product } from "@domain/product/entities/product.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { fakeProductRepository } from "@helpers/fakes";

const makeProduct = () => Product.create({ name: "Pants", price: Money.create(9999), stock: 100 });

describe("DeleteProductUseCase", () => {
  it("should delete an existing product", async () => {
    const product = makeProduct();
    const products: Product[] = [product];
    const useCase = new DeleteProductUseCase(fakeProductRepository(products));

    await useCase.execute({ productId: product.getId().getValue() });

    expect(products).toHaveLength(0);
  });

  it("should return success true", async () => {
    const product = makeProduct();
    const useCase = new DeleteProductUseCase(fakeProductRepository([product]));

    const output = await useCase.execute({ productId: product.getId().getValue() });

    expect(output.success).toBe(true);
  });

  it("should throw if product is not found", async () => {
    const product = makeProduct();
    const useCase = new DeleteProductUseCase(fakeProductRepository([]));

    await expect(useCase.execute({ productId: product.getId().getValue() })).rejects.toThrow("Product not found");
  });
});
