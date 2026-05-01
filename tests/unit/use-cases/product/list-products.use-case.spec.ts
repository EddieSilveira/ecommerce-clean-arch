import { ListProductsUseCase } from "@application/use-cases/product/list-products.use-case";
import { fakeProductRepository } from "@helpers/fakes";
import { Product } from "@domain/product/entities/product.entity";
import { Money } from "@domain/shared/value-objects/money.vo";

const makeProduct = (name: string) =>
  Product.create({ name, price: Money.create(10), stock: 5 });

describe("ListProductsUseCase", () => {
  it("should return all products when fewer than limit", async () => {
    const products = [makeProduct("A"), makeProduct("B")];
    const useCase = new ListProductsUseCase(fakeProductRepository(products));

    const output = await useCase.execute({ limit: 20 });

    expect(output.products).toHaveLength(2);
    expect(output.nextCursor).toBeNull();
  });

  it("should return nextCursor when more items exist", async () => {
    const products = Array.from({ length: 3 }, (_, i) => makeProduct(`Product ${i}`));
    const useCase = new ListProductsUseCase(fakeProductRepository(products));

    const output = await useCase.execute({ limit: 2 });

    expect(output.products).toHaveLength(2);
    expect(output.nextCursor).not.toBeNull();
  });

  it("should return second page using cursor", async () => {
    const products = Array.from({ length: 3 }, (_, i) => makeProduct(`Product ${i}`));
    const useCase = new ListProductsUseCase(fakeProductRepository(products));

    const firstPage = await useCase.execute({ limit: 2 });
    const secondPage = await useCase.execute({ cursor: firstPage.nextCursor!, limit: 2 });

    expect(secondPage.products).toHaveLength(1);
    expect(secondPage.nextCursor).toBeNull();
  });

  it("should use default limit of 20 when not specified", async () => {
    const products = Array.from({ length: 5 }, (_, i) => makeProduct(`Product ${i}`));
    const useCase = new ListProductsUseCase(fakeProductRepository(products));

    const output = await useCase.execute({});

    expect(output.products).toHaveLength(5);
  });
});
