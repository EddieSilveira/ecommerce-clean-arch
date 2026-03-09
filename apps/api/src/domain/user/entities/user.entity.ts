import { Email } from "../../shared/value-objects/email.vo";


export class User {
  private constructor(
    private readonly id: string,
    private name: string,
    private email: Email
  ) {}

  static create(props: { name: string; email: string }): User {
    if (!props.name || !props.name.trim()) {
      throw new Error("User name cannot be empty");
    }

    const email = Email.create(props.email);

    return new User(
      crypto.randomUUID(),
      props.name.trim(),
      email
    );
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email.getValue();
  }

  getEmailVO(): Email {
    return this.email;
  }
}