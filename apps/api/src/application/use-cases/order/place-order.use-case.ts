import { IOrderRepository } from "@application/ports/order.repository";
import { IProductRepository } from "@application/ports/product.repository";
import { IUserRepository } from "@application/ports/user.repository";
import { Order } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";


export interface PlaceOrderInput {
  userId: string;
  items: { productId: string; quantity: number }[];
}

export interface PlaceOrderOutput {
  id: string;
  userId: string;
  status: string;
  total: number;
  items: {
    id: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }[];
}

export class PlaceOrderUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly productRepository: IProductRepository,
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
    const userId = UUID.create(input.userId);

    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const order = Order.create({ userId });

    for (const item of input.items) {
      const productId = UUID.create(item.productId);

      const product = await this.productRepository.findById(productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (!product.isAvailable()) throw new Error(`Product "${product.getName()}" is out of stock`);

      product.decreaseStock(item.quantity);

      order.addItem({
        productId,
        productName: product.getName(),
        unitPrice: product.getPrice(),
        quantity: item.quantity,
      });

      await this.productRepository.save(product);
    }

    await this.orderRepository.save(order);

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
