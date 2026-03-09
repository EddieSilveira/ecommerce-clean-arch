import { Money } from "../../shared/value-objects/money.vo";
import { UUID } from "../../shared/value-objects/uuid.vo"

export class OrderItem {
    constructor(
        private readonly id: UUID,
        private productId: UUID,
        private productName: string,
        private unitPrice: Money,
        private quantity: number,
        private subtotal: Money
    ) { }

    static create(props: {
        productId: UUID 
        productName: string,
        unitPrice: Money,
        quantity: number
    }) {
        if(props.quantity <= 0) throw new Error("Quantity must be at least 1")
        return new OrderItem(
            UUID.create(),
            props.productId,
            props.productName,
            props.unitPrice,
            props.quantity,
            props.unitPrice.multiply(props.quantity)
        )
    }

    getProductId(): UUID { return this.productId };
    getQuantity(): number { return this.quantity };
    getProductName(): string { return this.productName };
    getUnitPrice(): Money { return this.unitPrice };
    getSubtotal(): Money { return this.subtotal}
}