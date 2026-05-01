import { Role } from "@domain/shared/role";

export interface ITokenProvider {
  generate(userId: string, role: Role): string;
}
