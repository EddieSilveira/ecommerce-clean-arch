import { Money } from "../shared/value-objects/money.vo";

export enum PaymentStatus {
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    PAID = 'PAID'
}

export class Payment {
    private constructor(
        private readonly id: string,
        private orderId: string,
        private amount: Money,
        private status: PaymentStatus
    ) { }

    static create(props: { orderId: string, amount: Money }) {
        if (props.orderId === undefined || !props.orderId.trim()) throw new Error("OrderId cannot be empty");
        if(props.amount.getValue() <= 0) throw new Error("Value cannot be negative") 
        return new Payment(
            crypto.randomUUID(),
            props.orderId,
            props.amount,
            PaymentStatus.PENDING
        );
    }
    getId(): string { return this.id }
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