import { IOrderRepository } from "@application/ports/order.repository";
import { IProductRepository } from "@application/ports/product.repository";
import { Actor } from "@domain/shared/role";
import { UnauthorizedError } from "@domain/shared/errors/unauthorized.error";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface CancelOrderInput {
  orderId: string;
  actor: Actor;
}

export class CancelOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(input: CancelOrderInput): Promise<void> {
    const order = await this.orderRepository.findById(UUID.create(input.orderId));
    if (!order) throw new Error("Order not found");

    if (input.actor.id !== order.getUserId().getValue()) throw new UnauthorizedError();

    order.cancel();

    const items = order.getItems();
    await Promise.all(
      items.map(async item => {
        const product = await this.productRepository.findById(item.getProductId());
        if (product) {
          product.increaseStock(item.getQuantity());
          await this.productRepository.save(product);
        }
      })
    );

    await this.orderRepository.save(order);
  }
}
