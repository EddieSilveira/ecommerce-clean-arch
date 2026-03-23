
import { fakeProductRepository } from "@helpers/fakes";
import { CreateProductUseCase } from "@application/use-cases/product/create-product.use-case";

const validInput = () => ({ name: "Pants", price: 9999, stock: 100 });

describe("CreateProductUseCase", () => {
  it("should create a product and return the productId", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    const output = await useCase.execute(validInput());

    expect(output.productId).toBeDefined();
  });

  it("should call repository save", async () => {
    const repo = fakeProductRepository();
    const saveSpy = jest.spyOn(repo, "save");
    const useCase = new CreateProductUseCase(repo);

    await useCase.execute(validInput());

    expect(saveSpy).toHaveBeenCalledTimes(1);
  });

  it("should throw if name is empty", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    await expect(useCase.execute({ ...validInput(), name: "" })).rejects.toThrow("Product name cannot be empty");
  });

  it("should throw if name is whitespace only", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    await expect(useCase.execute({ ...validInput(), name: "   " })).rejects.toThrow("Product name cannot be empty");
  });

  it("should throw if price is negative", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    await expect(useCase.execute({ ...validInput(), price: -1 })).rejects.toThrow("Value cannot be negative");
  });

  it("should throw if stock is negative", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    await expect(useCase.execute({ ...validInput(), stock: -1 })).rejects.toThrow("Stock cannot be negative");
  });

  it("should return a valid UUID as productId", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    const output = await useCase.execute(validInput());

    expect(output.productId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it("should return unique productIds for different products", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    const first = await useCase.execute(validInput());
    const second = await useCase.execute(validInput());

    expect(first.productId).not.toBe(second.productId);
  });

  it("should save the product with the correct data", async () => {
    const products: any[] = [];
    const useCase = new CreateProductUseCase(fakeProductRepository(products));

    await useCase.execute({ name: "Calça", price: 9999, stock: 100 });

    const saved = products[0];
    expect(saved.getName()).toBe("Calça");
    expect(saved.getPrice().getValue()).toBe(9999);
    expect(saved.getStock()).toBe(100);
  });

  it("should accept stock of 0", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    await expect(useCase.execute({ ...validInput(), stock: 0 })).resolves.toBeDefined();
  });

  it("should accept price of 0", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    await expect(useCase.execute({ ...validInput(), price: 0 })).resolves.toBeDefined();
  });

  it("should not call save if product creation fails", async () => {
    const repo = fakeProductRepository();
    const saveSpy = jest.spyOn(repo, "save");
    const useCase = new CreateProductUseCase(repo);

    await expect(useCase.execute({ ...validInput(), name: "" })).rejects.toThrow();

    expect(saveSpy).not.toHaveBeenCalled();
  });
});
