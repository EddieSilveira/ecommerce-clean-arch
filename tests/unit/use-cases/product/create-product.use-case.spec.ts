import { fakeProductRepository } from "@helpers/fakes";
import { CreateProductUseCase } from "@application/use-cases/product/create-product.use-case";

const adminActor = { id: 'admin-id', role: 'ADMIN' as const };
const validInput = () => ({ name: "Pants", price: 9999, stock: 100, actor: adminActor });

describe("CreateProductUseCase", () => {
  it("should return created product with id, name, price and stock", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    const output = await useCase.execute(validInput());

    expect(output).toMatchObject({ id: expect.any(String), name: "Pants", price: 9999, stock: 100 });
    expect(output).not.toHaveProperty('productId');
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

  it("should return a valid UUID as id", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    const output = await useCase.execute(validInput());

    expect(output.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it("should return unique ids for different products", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    const first = await useCase.execute(validInput());
    const second = await useCase.execute(validInput());

    expect(first.id).not.toBe(second.id);
  });

  it("should save the product with the correct data", async () => {
    const products: any[] = [];
    const useCase = new CreateProductUseCase(fakeProductRepository(products));

    await useCase.execute({ name: "Calça", price: 9999, stock: 100, actor: adminActor });

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

  it("should throw Forbidden when actor is not ADMIN", async () => {
    const useCase = new CreateProductUseCase(fakeProductRepository());

    await expect(
      useCase.execute({ name: "Laptop", price: 999, stock: 10, actor: { id: 'user-id', role: 'CUSTOMER' } })
    ).rejects.toThrow("Forbidden");
  });
});
