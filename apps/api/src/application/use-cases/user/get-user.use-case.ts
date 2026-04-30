import { IUserRepository } from "@application/ports/user.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface GetUserInput {
  userId: string;
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

    return {
      id: user.getId().getValue(),
      name: user.getName(),
      email: user.getEmail(),
    };
  }
}
