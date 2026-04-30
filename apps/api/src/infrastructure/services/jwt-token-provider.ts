import { ITokenProvider } from "@application/ports/token-provider";
import * as jwt from "jsonwebtoken";

export class JwtTokenProvider implements ITokenProvider {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  generate(userId: string): string {
    return jwt.sign({ userId }, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }
}
