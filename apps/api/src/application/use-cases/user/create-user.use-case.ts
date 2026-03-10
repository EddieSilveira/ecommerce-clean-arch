import { IHasher } from "@application/ports/hasher";
import { IUserRepository } from "@application/ports/user.repository";
import { Password } from "@domain/shared/value-objects/password.vo";
import { User } from "@domain/user/entities/user.entity";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserOutput {
  userId: string;
}

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: IHasher
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new Error("Email already in use");

    const password = Password.create(input.password);
    const passwordHash = await this.hasher.hash(password.getValue());

    const user = User.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    await this.userRepository.save(user);

    return { userId: user.getId().getValue() };
  }
}
