import { IOrderRepository } from "@application/ports/order.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface ListOrdersInput {
  userId: string;
  cursor?: string | undefined;
  limit?: number | undefined;
}

export interface ListOrdersOutput {
  orders: {
    id: string;
    status: string;
    total: number;
  }[];
  nextCursor: string | null;
}

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: ListOrdersInput): Promise<ListOrdersOutput> {
    const limit = input.limit ?? 20;
    const { items, nextCursor } = await this.orderRepository.findByUserId(
      UUID.create(input.userId),
      { cursor: input.cursor, limit }
    );

    return {
      orders: items.map(order => ({
        id: order.getId().getValue(),
        status: order.getStatus(),
        total: order.getTotal().getValue(),
      })),
      nextCursor,
    };
  }
}
