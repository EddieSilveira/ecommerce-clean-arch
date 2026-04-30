import { IOrderRepository } from "@application/ports/order.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface ListOrdersInput {
  userId: string;
}

export interface ListOrdersItemOutput {
  id: string;
  status: string;
  total: number;
}

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: ListOrdersInput): Promise<ListOrdersItemOutput[]> {
    const orders = await this.orderRepository.findByUserId(UUID.create(input.userId));

    return orders.map(order => ({
      id: order.getId().getValue(),
      status: order.getStatus(),
      total: order.getTotal().getValue(),
    }));
  }
}
