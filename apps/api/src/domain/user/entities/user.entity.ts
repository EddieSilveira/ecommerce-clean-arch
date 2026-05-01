import { Email } from "../../shared/value-objects/email.vo";
import { UUID } from "../../shared/value-objects/uuid.vo";
import { Role } from "../../shared/role";

export class User {
  private resetToken?: string | undefined;
  private resetTokenExpiresAt?: Date | undefined;

  private constructor(
    private readonly id: UUID,
    private name: string,
    private email: Email,
    private passwordHash: string,
    private role: Role = 'CUSTOMER'
  ) { }

  static create(props: { name: string; email: string; passwordHash: string; role?: Role }): User {
    if (!props.name || !props.name.trim()) {
      throw new Error("User name cannot be empty");
    }
    if (!props.passwordHash) {
      throw new Error("Password hash cannot be empty");
    }

    const email = Email.create(props.email);

    return new User(
      UUID.create(),
      props.name.trim(),
      email,
      props.passwordHash,
      props.role ?? 'CUSTOMER'
    );
  }

  static reconstruct(props: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    resetToken?: string | null;
    resetTokenExpiresAt?: Date | null;
    role?: Role;
  }): User {
    const user = new User(
      UUID.create(props.id),
      props.name,
      Email.create(props.email),
      props.passwordHash,
      props.role ?? 'CUSTOMER'
    );
    if (props.resetToken && props.resetTokenExpiresAt) {
      user.setResetToken(props.resetToken, props.resetTokenExpiresAt);
    }
    return user;
  }

  update(props: { name?: string; email?: string; passwordHash?: string }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) throw new Error("User name cannot be empty");
      this.name = props.name.trim();
    }
    if (props.email !== undefined) {
      this.email = Email.create(props.email);
    }
    if (props.passwordHash !== undefined) {
      this.passwordHash = props.passwordHash;
    }
  }

  getId(): UUID { return this.id; }
  getName(): string { return this.name; }
  getEmail(): string { return this.email.getValue(); }
  getPasswordHash(): string { return this.passwordHash; }
  getRole(): Role { return this.role; }

  setResetToken(token: string, expiresAt: Date): void {
    this.resetToken = token;
    this.resetTokenExpiresAt = expiresAt;
  }

  clearResetToken(): void {
    this.resetToken = undefined;
    this.resetTokenExpiresAt = undefined;
  }

  getResetToken(): string | undefined { return this.resetToken; }
  getResetTokenExpiresAt(): Date | undefined { return this.resetTokenExpiresAt; }
}
