import { Order } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";
import { PaginationParams, PaginatedResult } from "./pagination";

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: UUID): Promise<Order | null>;
  findByUserId(userId: UUID, params: PaginationParams): Promise<PaginatedResult<Order>>;
}
