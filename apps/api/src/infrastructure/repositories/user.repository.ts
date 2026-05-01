import { IUserRepository } from "@application/ports/user.repository";
import { User } from "@domain/user/entities/user.entity";
import { Role } from "@domain/shared/role";
import { UUID } from "@domain/shared/value-objects/uuid.vo";
import { PrismaClient } from "@prisma/client";

export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private rowToUser(row: Awaited<ReturnType<PrismaClient['user']['findUniqueOrThrow']>>): User {
    return User.reconstruct({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role as Role,
      resetToken: row.resetToken,
      resetTokenExpiresAt: row.resetTokenExpiresAt,
    });
  }

  async findById(id: UUID): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id: id.getValue() } });
    if (!row) return null;
    return this.rowToUser(row);
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    if (!row) return null;
    return this.rowToUser(row);
  }

  async findByResetToken(token: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({ where: { resetToken: token } });
    if (!row) return null;
    return this.rowToUser(row);
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.getId().getValue() },
      create: {
        id: user.getId().getValue(),
        name: user.getName(),
        email: user.getEmail(),
        passwordHash: user.getPasswordHash(),
        role: user.getRole(),
        resetToken: user.getResetToken() ?? null,
        resetTokenExpiresAt: user.getResetTokenExpiresAt() ?? null,
      },
      update: {
        name: user.getName(),
        email: user.getEmail(),
        passwordHash: user.getPasswordHash(),
        role: user.getRole(),
        resetToken: user.getResetToken() ?? null,
        resetTokenExpiresAt: user.getResetTokenExpiresAt() ?? null,
      },
    });
  }

  async delete(userId: UUID): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId.getValue() } });
  }
}
