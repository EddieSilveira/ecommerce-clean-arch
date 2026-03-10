import { IHasher } from "@application/ports/hasher";
import { IUserRepository } from "@application/ports/user.repository";
import { Password } from "@domain/shared/value-objects/password.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface UpdateUserInput {
  userId: string;
  name?: string;
  email?: string;
  password?: string;
}

export interface UpdateUserOutput {
  userId: string;
}

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: IHasher
  ) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const user = await this.userRepository.findById(UUID.create(input.userId));
    if (!user) throw new Error("User not found");

    let passwordHash: string | undefined;
    if (input.password !== undefined) {
      const password = Password.create(input.password);
      passwordHash = await this.hasher.hash(password.getValue());
    }

    const updateProps: { name?: string; email?: string; passwordHash?: string } = {};
    if (input.name !== undefined) updateProps.name = input.name;
    if (input.email !== undefined) updateProps.email = input.email;
    if (passwordHash !== undefined) updateProps.passwordHash = passwordHash;

    user.update(updateProps);

    await this.userRepository.save(user);

    return { userId: user.getId().getValue() };
  }
}
