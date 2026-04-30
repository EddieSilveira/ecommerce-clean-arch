import { IPaymentRepository } from "@application/ports/payment.repository";
import { Payment, PaymentStatus } from "@domain/payment/payment.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";
import { PrismaClient } from "@prisma/client";

export class PaymentPrismaRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UUID): Promise<Payment | null> {
    const row = await this.prisma.payment.findUnique({ where: { id: id.getValue() } });
    if (!row) return null;
    return Payment.reconstruct({
      id: row.id,
      orderId: row.orderId,
      amount: Money.create(row.amount.toNumber()),
      status: row.status as PaymentStatus,
    });
  }

  async findByOrderId(orderId: UUID): Promise<Payment | null> {
    const row = await this.prisma.payment.findUnique({ where: { orderId: orderId.getValue() } });
    if (!row) return null;
    return Payment.reconstruct({
      id: row.id,
      orderId: row.orderId,
      amount: Money.create(row.amount.toNumber()),
      status: row.status as PaymentStatus,
    });
  }

  async save(payment: Payment): Promise<void> {
    await this.prisma.payment.upsert({
      where: { id: payment.getId().getValue() },
      create: {
        id: payment.getId().getValue(),
        orderId: payment.getOrderId().getValue(),
        amount: payment.getAmount().getValue(),
        status: payment.getStatus(),
      },
      update: {
        status: payment.getStatus(),
      },
    });
  }
}
