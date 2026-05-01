import { ITokenProvider } from "@application/ports/token-provider";
import { Role } from "@domain/shared/role";
import * as jwt from "jsonwebtoken";

export class JwtTokenProvider implements ITokenProvider {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  generate(userId: string, role: Role): string {
    return jwt.sign({ userId, role }, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }
}
