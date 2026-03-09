import { Product } from "../../apps/api/src/domain/product/entities/product.entity";
import { Money } from "../../apps/api/src/domain/shared/value-objects/money.vo";

describe("Product", () => {
  const validProps = () => ({
    name: "Camiseta",
    price: Money.create(99.9),
    stock: 10,
  });

  describe("create", () => {
    it("should create a valid product", () => {
      const product = Product.create(validProps());
      expect(product.getName()).toBe("Camiseta");
      expect(product.getPrice().getValue()).toBe(99.9);
      expect(product.getStock()).toBe(10);
    });

    it("should generate an id automatically", () => {
      const product = Product.create(validProps());
      expect(product.getId()).toBeDefined();
    });

    it("should throw when name is empty", () => {
      expect(() => Product.create({ ...validProps(), name: "" })).toThrow(
        "Product name cannot be empty"
      );
    });

    it("should throw when name is only whitespace", () => {
      expect(() => Product.create({ ...validProps(), name: "   " })).toThrow(
        "Product name cannot be empty"
      );
    });

    it("should throw when stock is negative", () => {
      expect(() => Product.create({ ...validProps(), stock: -1 })).toThrow(
        "Stock cannot be negative"
      );
    });

    it("should allow stock to be zero", () => {
      const product = Product.create({ ...validProps(), stock: 0 });
      expect(product.getStock()).toBe(0);
    });
  });

  describe("decreaseStock", () => {
    it("should decrease stock correctly", () => {
      const product = Product.create(validProps());
      product.decreaseStock(3);
      expect(product.getStock()).toBe(7);
    });

    it("should throw when decreasing more than available stock", () => {
      const product = Product.create(validProps());
      expect(() => product.decreaseStock(11)).toThrow("Insufficient stock");
    });

    it("should throw when quantity is zero or negative", () => {
      const product = Product.create(validProps());
      expect(() => product.decreaseStock(0)).toThrow("Quantity must be greater than zero");
      expect(() => product.decreaseStock(-1)).toThrow("Quantity must be greater than zero");
    });

    it("should allow stock to reach exactly zero", () => {
      const product = Product.create(validProps());
      product.decreaseStock(10);
      expect(product.getStock()).toBe(0);
    });
  });

  describe("increaseStock", () => {
    it("should increase stock correctly", () => {
      const product = Product.create(validProps());
      product.increaseStock(5);
      expect(product.getStock()).toBe(15);
    });

    it("should throw when quantity is zero or negative", () => {
      const product = Product.create(validProps());
      expect(() => product.increaseStock(0)).toThrow("Quantity must be greater than zero");
    });
  });

  describe("isAvailable", () => {
    it("should return true when stock is greater than zero", () => {
      const product = Product.create(validProps());
      expect(product.isAvailable()).toBe(true);
    });

    it("should return false when stock is zero", () => {
      const product = Product.create({ ...validProps(), stock: 0 });
      expect(product.isAvailable()).toBe(false);
    });
  });
});