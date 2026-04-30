import { IUserRepository } from "@application/ports/user.repository";
import { User } from "@domain/user/entities/user.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";
import { PrismaClient } from "@prisma/client";

export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UUID): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id: id.getValue() } });
    if (!row) return null;
    return User.reconstruct(row);
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    if (!row) return null;
    return User.reconstruct(row);
  }

  async findByResetToken(token: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({ where: { resetToken: token } });
    if (!row) return null;
    return User.reconstruct(row);
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.getId().getValue() },
      create: {
        id: user.getId().getValue(),
        name: user.getName(),
        email: user.getEmail(),
        passwordHash: user.getPasswordHash(),
        resetToken: user.getResetToken() ?? null,
        resetTokenExpiresAt: user.getResetTokenExpiresAt() ?? null,
      },
      update: {
        name: user.getName(),
        email: user.getEmail(),
        passwordHash: user.getPasswordHash(),
        resetToken: user.getResetToken() ?? null,
        resetTokenExpiresAt: user.getResetTokenExpiresAt() ?? null,
      },
    });
  }

  async delete(userId: UUID): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId.getValue() } });
  }
}
