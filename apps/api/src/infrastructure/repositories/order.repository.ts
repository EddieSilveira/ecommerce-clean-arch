import { IOrderRepository } from "@application/ports/order.repository";
import { PaginationParams, PaginatedResult } from "@application/ports/pagination";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { OrderItem } from "@domain/order/entities/order-item.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";
import { PrismaClient } from "@prisma/client";

type OrderRow = Awaited<ReturnType<PrismaClient["order"]["findUnique"]>> & {
  items: Awaited<ReturnType<PrismaClient["orderItem"]["findMany"]>>;
};

function rowToOrder(row: NonNullable<OrderRow>): Order {
  const items = row.items.map(item =>
    OrderItem.reconstruct({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      unitPrice: Money.create(item.unitPrice.toNumber()),
      quantity: item.quantity,
      subtotal: Money.create(item.subtotal.toNumber()),
    })
  );
  return Order.reconstruct({
    id: row.id,
    userId: row.userId,
    items,
    status: row.status as OrderStatus,
    total: Money.create(row.total.toNumber()),
  });
}

export class OrderPrismaRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UUID): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({
      where: { id: id.getValue() },
      include: { items: true },
    });
    if (!row) return null;
    return rowToOrder(row);
  }

  async findByUserId(userId: UUID, params: PaginationParams): Promise<PaginatedResult<Order>> {
    const rows = await this.prisma.order.findMany({
      where: { userId: userId.getValue() },
      take: params.limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      orderBy: { id: 'asc' },
      include: { items: true },
    });

    const hasNext = rows.length > params.limit;
    const page = hasNext ? rows.slice(0, params.limit) : rows;
    const nextCursor = hasNext ? page[page.length - 1]!.id : null;

    return { items: page.map(rowToOrder), nextCursor };
  }

  async save(order: Order): Promise<void> {
    await this.prisma.order.upsert({
      where: { id: order.getId().getValue() },
      create: {
        id: order.getId().getValue(),
        userId: order.getUserId().getValue(),
        status: order.getStatus(),
        total: order.getTotal().getValue(),
        items: {
          create: order.getItems().map(item => ({
            id: item.getId().getValue(),
            productId: item.getProductId().getValue(),
            productName: item.getProductName(),
            unitPrice: item.getUnitPrice().getValue(),
            quantity: item.getQuantity(),
            subtotal: item.getSubtotal().getValue(),
          })),
        },
      },
      update: {
        status: order.getStatus(),
        total: order.getTotal().getValue(),
      },
    });
  }
}
