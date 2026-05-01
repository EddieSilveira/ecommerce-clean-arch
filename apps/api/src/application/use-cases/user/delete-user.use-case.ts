import { IUserRepository } from "@application/ports/user.repository";
import { Actor } from "@domain/shared/role";
import { UnauthorizedError } from "@domain/shared/errors/unauthorized.error";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface DeleteUserInput {
  userId: string;
  actor: Actor;
}

export interface DeleteUserOutput {
  success: boolean;
}

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: DeleteUserInput): Promise<DeleteUserOutput> {
    const user = await this.userRepository.findById(UUID.create(input.userId));
    if (!user) throw new Error("User not found");

    const isOwner = input.actor.id === input.userId;
    const isAdmin = input.actor.role === 'ADMIN';
    if (!isOwner && !isAdmin) throw new UnauthorizedError();

    await this.userRepository.delete(user.getId());

    return { success: true };
  }
}
