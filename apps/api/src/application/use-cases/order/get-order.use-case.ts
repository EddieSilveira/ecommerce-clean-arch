import { IOrderRepository } from "@application/ports/order.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface GetOrderInput {
  orderId: string;
}

export interface GetOrderItemOutput {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface GetOrderOutput {
  id: string;
  userId: string;
  status: string;
  total: number;
  items: GetOrderItemOutput[];
}

export class GetOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: GetOrderInput): Promise<GetOrderOutput> {
    const order = await this.orderRepository.findById(UUID.create(input.orderId));
    if (!order) throw new Error("Order not found");

    return {
      id: order.getId().getValue(),
      userId: order.getUserId().getValue(),
      status: order.getStatus(),
      total: order.getTotal().getValue(),
      items: order.getItems().map(item => ({
        id: item.getId().getValue(),
        productId: item.getProductId().getValue(),
        productName: item.getProductName(),
        unitPrice: item.getUnitPrice().getValue(),
        quantity: item.getQuantity(),
        subtotal: item.getSubtotal().getValue(),
      })),
    };
  }
}
