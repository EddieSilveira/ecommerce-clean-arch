import { IUserRepository } from "@application/ports/user.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface DeleteUserInput {
    userId: string;
}

export interface DeleteUserOutput {
    success: boolean
}

export class DeleteUserUseCase {
    constructor(
        private userRepository: IUserRepository
    ) { }

    async execute(input: DeleteUserInput): Promise<DeleteUserOutput> {
        const user = await this.userRepository.findById(UUID.create(input.userId));
        if (!user) throw new Error("User not found");

        await this.userRepository.delete(user.getId());

        return {
            success: true
        }
    }
}