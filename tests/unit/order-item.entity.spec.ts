import { OrderItem } from "../../apps/api/src/domain/order/entities/order-item.entity";
import { Money } from "../../apps/api/src/domain/shared/value-objects/money.vo";
import { UUID } from "../../apps/api/src/domain/shared/value-objects/uuid.vo";

describe("OrderItem", () => {
  const productId = UUID.create();
  const validProps = () => ({
    productId: productId,
    productName: "Camiseta",
    unitPrice: Money.create(99.9),
    quantity: 2,
  });

  describe("create", () => {
    it("should create a valid order item", () => {
      const item = OrderItem.create(validProps());
      expect(item.getProductId()).toBe(productId);
      expect(item.getProductName()).toBe("Camiseta");
      expect(item.getQuantity()).toBe(2);
      expect(item.getUnitPrice().getValue()).toBe(99.9);
    });

    it("should throw when quantity is zero", () => {
      expect(() => OrderItem.create({ ...validProps(), quantity: 0 })).toThrow(
        "Quantity must be at least 1"
      );
    });

    it("should throw when quantity is negative", () => {
      expect(() => OrderItem.create({ ...validProps(), quantity: -1 })).toThrow(
        "Quantity must be at least 1"
      );
    });

    it("should throw when productId is invalid", () => {
      expect(() => UUID.create("")).toThrow("Invalid UUID");
    });
  });

  describe("getSubtotal", () => {
    it("should calculate subtotal correctly", () => {
      const item = OrderItem.create(validProps());
      expect(item.getSubtotal().getValue()).toBe(199.8);
    });

    it("should calculate subtotal for quantity 1", () => {
      const item = OrderItem.create({ ...validProps(), quantity: 1 });
      expect(item.getSubtotal().getValue()).toBe(99.9);
    });
  });
});