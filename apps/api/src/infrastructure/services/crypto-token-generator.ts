import { ITokenGenerator } from "@application/ports/token-generator";
import { randomBytes } from "crypto";

export class CryptoTokenGenerator implements ITokenGenerator {
  generate(): string {
    return randomBytes(32).toString("hex");
  }
}
