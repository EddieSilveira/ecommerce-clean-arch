import { Payment } from "@domain/payment/payment.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface IPaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: UUID): Promise<Payment | null>;
  findByOrderId(orderId: UUID): Promise<Payment | null>;
}
