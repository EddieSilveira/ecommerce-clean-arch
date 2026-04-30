import { IOrderRepository } from "@application/ports/order.repository";
import { IPaymentRepository } from "@application/ports/payment.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface ApprovePaymentInput {
  paymentId: string;
}

export class ApprovePaymentUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(input: ApprovePaymentInput): Promise<void> {
    const payment = await this.paymentRepository.findById(UUID.create(input.paymentId));
    if (!payment) throw new Error("Payment not found");

    const order = await this.orderRepository.findById(payment.getOrderId());
    if (!order) throw new Error("Order not found");

    payment.approve();
    order.confirm();

    await this.paymentRepository.save(payment);
    await this.orderRepository.save(order);
  }
}
