import { Order, OrderStatus } from "../../apps/api/src/domain/order/entities/order.entity";
import { Money } from "../../apps/api/src/domain/shared/value-objects/money.vo";
import { UUID } from "../../apps/api/src/domain/shared/value-objects/uuid.vo";


describe("Order", () => {
  const validProps = () => ({
    userId: UUID.create(),
  });

  const itemProps = () => ({
    productId: UUID.create(),
    productName: "Camiseta",
    unitPrice: Money.create(99.9),
    quantity: 2,
  });

  describe("create", () => {
    it("should create a order with pending status", () => {
      const order = Order.create(validProps());
      expect(order.getStatus()).toBe(OrderStatus.PENDING);
    });

    it("should create an order with empty items", () => {
      const order = Order.create(validProps());
      expect(order.getItems()).toHaveLength(0);
    });

    it("should generate an id automatically", () => {
      const order = Order.create(validProps());
      expect(order.getId()).toBeDefined();
    });

    it("should throw when userId is invalid", () => {
      expect(() => UUID.create("")).toThrow("Invalid UUID");
    });

  });

  describe("addItem", () => {
    it("should add an item to the order", () => {
      const order = Order.create(validProps());
      order.addItem(itemProps());
      expect(order.getItems()).toHaveLength(1);
    });

    it("should add multiple items", () => {
      const order = Order.create(validProps());
      order.addItem(itemProps());
      order.addItem({ ...itemProps(), productId: UUID.create(), productName: "Calça" });
      expect(order.getItems()).toHaveLength(2);
    });

    it("should throw when adding item to a confirmed order", () => {
      const order = Order.create(validProps());
      order.addItem(itemProps());
      order.confirm();
      expect(() => order.addItem(itemProps())).toThrow(
        "Cannot add items to a non-pending order"
      );
    });

    it("should throw when adding item to a cancelled order", () => {
      const order = Order.create(validProps());
      order.cancel();
      expect(() => order.addItem(itemProps())).toThrow(
        "Cannot add items to a non-pending order"
      );
    });
  });

  describe("getTotal", () => {
    it("should return zero when order has no items", () => {
      const order = Order.create(validProps());
      expect(order.getTotal().getValue()).toBe(0);
    });

    it("should calculate total correctly with one item", () => {
      const order = Order.create(validProps());
      order.addItem(itemProps()); // 99.9 * 2 = 199.8
      expect(order.getTotal().getValue()).toBe(199.8);
    });

    it("should calculate total correctly with multiple items", () => {
      const order = Order.create(validProps());
      order.addItem(itemProps()); // 99.9 * 2 = 199.8
      order.addItem({ ...itemProps(), productId: UUID.create(), unitPrice: Money.create(50), quantity: 1 }); // 50
      expect(order.getTotal().getValue()).toBe(249.8);
    });
  });

  describe("confirm", () => {
    it("should confirm a pending order with items", () => {
      const order = Order.create(validProps());
      order.addItem(itemProps());
      order.confirm();
      expect(order.getStatus()).toBe(OrderStatus.CONFIRMED);
    });

    it("should throw when confirming an order without items", () => {
      const order = Order.create(validProps());
      expect(() => order.confirm()).toThrow("Cannot confirm an order without items");
    });

    it("should throw when confirming an already confirmed order", () => {
      const order = Order.create(validProps());
      order.addItem(itemProps());
      order.confirm();
      expect(() => order.confirm()).toThrow("Order is not pending");
    });

    it("should throw when confirming a cancelled order", () => {
      const order = Order.create(validProps());
      order.cancel();
      expect(() => order.confirm()).toThrow("Order is not pending");
    });
  });

  describe("cancel", () => {
    it("should cancel a pending order", () => {
      const order = Order.create(validProps());
      order.cancel();
      expect(order.getStatus()).toBe(OrderStatus.CANCELLED);
    });

    it("should throw when cancelling a confirmed order", () => {
      const order = Order.create(validProps());
      order.addItem(itemProps());
      order.confirm();
      expect(() => order.cancel()).toThrow("Cannot cancel a confirmed order");
    });

    it("should throw when cancelling an already cancelled order", () => {
      const order = Order.create(validProps());
      order.cancel();
      expect(() => order.cancel()).toThrow("Cannot cancel a cancelled order");
    });
  });

  // describe("domain events", () => {
  //   it("should emit OrderPlacedEvent when confirmed", () => {
  //     const order = Order.create(validProps());
  //     order.addItem(itemProps());
  //     order.confirm();
  //     const events = order.pullDomainEvents();
  //     expect(events).toHaveLength(1);
  //     expect(events[0].constructor.name).toBe("OrderPlacedEvent");
  //   });

  //   it("should emit OrderCancelledEvent when cancelled", () => {
  //     const order = Order.create(validProps());
  //     order.cancel();
  //     const events = order.pullDomainEvents();
  //     expect(events).toHaveLength(1);
  //     expect(events[0].constructor.name).toBe("OrderCancelledEvent");
  //   });

  //   it("should clear events after pulling", () => {
  //     const order = Order.create(validProps());
  //     order.cancel();
  //     order.pullDomainEvents();
  //     expect(order.pullDomainEvents()).toHaveLength(0);
  //   });
  // });
});