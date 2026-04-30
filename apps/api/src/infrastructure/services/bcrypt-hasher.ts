import { IHasher } from "@application/ports/hasher";
import * as bcrypt from "bcryptjs";

export class BcryptHasher implements IHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
