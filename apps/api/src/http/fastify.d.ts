import "@fastify/jwt";
import type { Role } from "@domain/shared/role";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: string; role: Role };
    user: { userId: string; role: Role };
  }
}
