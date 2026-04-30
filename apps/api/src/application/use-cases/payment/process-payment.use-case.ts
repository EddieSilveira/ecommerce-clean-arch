import { IOrderRepository } from "@application/ports/order.repository";
import { IPaymentRepository } from "@application/ports/payment.repository";
import { OrderStatus } from "@domain/order/entities/order.entity";
import { Payment } from "@domain/payment/payment.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface ProcessPaymentInput {
  orderId: string;
  amount: number;
}

export interface ProcessPaymentOutput {
  paymentId: string;
}

export class ProcessPaymentUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentRepository: IPaymentRepository
  ) {}

  async execute(input: ProcessPaymentInput): Promise<ProcessPaymentOutput> {
    const order = await this.orderRepository.findById(UUID.create(input.orderId));
    if (!order) throw new Error("Order not found");
    if (order.getStatus() !== OrderStatus.PENDING) throw new Error("Order is not pending");

    const payment = Payment.create({
      orderId: order.getId(),
      amount: Money.create(input.amount),
    });

    await this.paymentRepository.save(payment);

    return { paymentId: payment.getId().getValue() };
  }
}
