import { Money } from "../../shared/value-objects/money.vo";
import { UUID } from "../../shared/value-objects/uuid.vo";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED"
}

export class Order {
    constructor(
        private readonly id: UUID,
        private userId: UUID,
        private items: OrderItem[],
        private status: OrderStatus,
        private total: Money
    ) { }

    static create(props: { userId: UUID }) {
        if (!props.userId) throw new Error("")
        return new Order(
            UUID.create(),
            props.userId,
            [],
            OrderStatus.PENDING,
            Money.create(0)
        )
    }

    getId(): UUID { return this.id };
    getStatus(): OrderStatus { return this.status };
    addItem(props: {
        productId: UUID,
        productName: string,
        unitPrice: Money,
        quantity: number,
    }) {
        if (this.status !== OrderStatus.PENDING) throw new Error("Cannot add items to a non-pending order");
        const orderItem = OrderItem.create(props);
        this.items.push(orderItem);
        this.total = this.total.add(orderItem.getSubtotal());
    }
    getItems(): OrderItem[] { return this.items };
    confirm() {
        if (this.status !== OrderStatus.PENDING) throw new Error("Order is not pending");
        if (this.items.length === 0) throw new Error("Cannot confirm an order without items");
        this.status = OrderStatus.CONFIRMED;
    }
    cancel() {
        if (this.status === OrderStatus.CONFIRMED) throw new Error("Cannot cancel a confirmed order");
         if (this.status === OrderStatus.CANCELLED) throw new Error("Cannot cancel a cancelled order");
        this.status = OrderStatus.CANCELLED;
    }
    getTotal(): Money { return this.total };
    pullDomainEvents() { }
}