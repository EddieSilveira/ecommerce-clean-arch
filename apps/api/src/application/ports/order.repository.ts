import { Order } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: UUID): Promise<Order | null>;
}
