import { IOrderRepository } from "@application/ports/order.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface CancelOrderInput {
  orderId: string;
}

export class CancelOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: CancelOrderInput): Promise<void> {
    const order = await this.orderRepository.findById(UUID.create(input.orderId));
    if (!order) throw new Error("Order not found");

    order.cancel();
    await this.orderRepository.save(order);
  }
}
