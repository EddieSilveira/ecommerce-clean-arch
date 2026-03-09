import { Money } from "../../shared/value-objects/money.vo";
import { UUID } from "../../shared/value-objects/uuid.vo";

export class Product {
    private constructor(
        private readonly id: UUID,
        private name: string,
        private price: Money,
        private stock: number,
    ) { }

    static create(props: { name: string; price: Money; stock: number }): Product {
        if (!props.name.trim()) throw new Error("Product name cannot be empty");
        if (props.stock < 0) throw new Error("Stock cannot be negative");

        return new Product(
            UUID.create(crypto.randomUUID()),
            props.name,
            props.price,
            props.stock,
        );
    }

    getName(): string { return this.name; }
    getPrice(): Money { return this.price; }
    getStock(): number { return this.stock; }
    getId(): UUID { return this.id; }
    increaseStock(quantity: number): void {
        if (quantity <= 0) {
            throw new Error("Quantity must be greater than zero!");
        }
        this.stock += quantity;
    }
    decreaseStock(quantity: number): void {
        if (!this.isAvailable()) {
            throw new Error("Insufficient stock");
        }
        if(quantity > this.stock){
            throw new Error("Insufficient stock");
        }
        if(quantity <= 0){
            throw new Error("Quantity must be greater than zero");
        }
        this.stock -= quantity;
    }
    isAvailable(): boolean {
        if (this.stock <= 0) return false;
        return true;
    }
}