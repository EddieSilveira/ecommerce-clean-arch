import { UUID } from "@domain/shared/value-objects/uuid.vo";
import { User } from "@domain/user/entities/user.entity";

export interface IUserRepository {
  findById(id: UUID): Promise<User | null>;
  save(user: User): Promise<void>;
}
