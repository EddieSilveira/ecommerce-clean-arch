import { IUserRepository } from "@application/ports/user.repository";
import { IHasher } from "@application/ports/hasher";
import { User } from "@domain/user/entities/user.entity";

interface BootstrapEnv {
  ADMIN_EMAIL?: string | undefined;
  ADMIN_PASSWORD?: string | undefined;
}

export async function bootstrapAdmin(
  config: BootstrapEnv,
  deps: { userRepo: IUserRepository; hasher: IHasher }
): Promise<void> {
  if (!config.ADMIN_EMAIL || !config.ADMIN_PASSWORD) return;

  const existing = await deps.userRepo.findByEmail(config.ADMIN_EMAIL);
  if (existing) return;

  const passwordHash = await deps.hasher.hash(config.ADMIN_PASSWORD);
  const admin = User.create({
    name: 'Admin',
    email: config.ADMIN_EMAIL,
    passwordHash,
    role: 'ADMIN',
  });
  await deps.userRepo.save(admin);
}
