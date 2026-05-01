import { IUserRepository } from "@application/ports/user.repository";
import { Actor } from "@domain/shared/role";
import { UnauthorizedError } from "@domain/shared/errors/unauthorized.error";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface GetUserInput {
  userId: string;
  actor: Actor;
}

export interface GetUserOutput {
  id: string;
  name: string;
  email: string;
}

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetUserInput): Promise<GetUserOutput> {
    const user = await this.userRepository.findById(UUID.create(input.userId));
    if (!user) throw new Error("User not found");

    const isOwner = input.actor.id === input.userId;
    const isAdmin = input.actor.role === 'ADMIN';
    if (!isOwner && !isAdmin) throw new UnauthorizedError();

    return {
      id: user.getId().getValue(),
      name: user.getName(),
      email: user.getEmail(),
    };
  }
}
