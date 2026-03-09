import { DomainEvent } from "../../shared/domain-event";
import { UUID } from "../../shared/value-objects/uuid.vo";

export class OrderPlacedEvent implements DomainEvent {
  occurredAt = new Date();
  constructor(public readonly orderId: UUID) {}
}
