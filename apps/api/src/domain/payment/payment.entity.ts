import { Money } from "../shared/value-objects/money.vo";
import { UUID } from "../shared/value-objects/uuid.vo";

export enum PaymentStatus {
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    PAID = 'PAID'
}

export class Payment {
    private constructor(
        private readonly id: UUID,
        private orderId: UUID,
        private amount: Money,
        private status: PaymentStatus
    ) { }

    static create(props: { orderId: UUID, amount: Money }) {
        if(props.amount.getValue() <= 0) throw new Error("Value cannot be negative")
        return new Payment(
            UUID.create(),
            props.orderId,
            props.amount,
            PaymentStatus.PENDING
        );
    }
    static reconstruct(props: {
        id: string;
        orderId: string;
        amount: Money;
        status: PaymentStatus;
    }): Payment {
        return new Payment(
            UUID.create(props.id),
            UUID.create(props.orderId),
            props.amount,
            props.status
        );
    }

    getId(): UUID { return this.id }
    getOrderId(): UUID { return this.orderId }
    getStatus(): PaymentStatus { return this.status }
    getAmount(): Money { return this.amount }
    approve() {
        if (this.status !== PaymentStatus.PENDING) throw new Error("Only pending payments can be approved");
        this.status = PaymentStatus.PAID
    };
    fail() {
        if (this.status !== PaymentStatus.PENDING) throw new Error("Only pending payments can be failed");
        this.status = PaymentStatus.FAILED
    };
    isPaid(): boolean { return this.status === PaymentStatus.PAID }
}