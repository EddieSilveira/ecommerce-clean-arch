import { ListProductsUseCase } from "@application/use-cases/product/list-products.use-case";
import { Product } from "@domain/product/entities/product.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { fakeProductRepository } from "@helpers/fakes";

const makeProduct = (name = "T-shirt", price = 6990, stock = 50) =>
  Product.create({ name, price: Money.create(price), stock });

describe("ListProductsUseCase", () => {
  it("should return an empty list when there are no products", async () => {
    const useCase = new ListProductsUseCase(fakeProductRepository());

    const output = await useCase.execute();

    expect(output.products).toHaveLength(0);
  });

  it("should return all products", async () => {
    const products = [makeProduct(), makeProduct("Shorts", 4990, 30)];
    const useCase = new ListProductsUseCase(fakeProductRepository(products));

    const output = await useCase.execute();

    expect(output.products).toHaveLength(2);
  });

  it("should return products with correct data", async () => {
    const product = makeProduct("T-shirt", 6990, 50);
    const useCase = new ListProductsUseCase(fakeProductRepository([product]));

    const output = await useCase.execute();

    expect(output.products[0]).toEqual({
      productId: product.getId().getValue(),
      name: "T-shirt",
      price: 6990,
      stock: 50,
    });
  });

  it("should return a productId for each product", async () => {
    const products = [makeProduct(), makeProduct("Shorts", 4990, 30)];
    const useCase = new ListProductsUseCase(fakeProductRepository(products));

    const output = await useCase.execute();

    output.products.forEach(p => {
      expect(p.productId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
  });
});
