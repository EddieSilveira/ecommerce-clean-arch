import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.middleware";
import { CreateUserUseCase } from "@application/use-cases/user/create-user.use-case";
import { GetUserUseCase } from "@application/use-cases/user/get-user.use-case";
import { UpdateUserUseCase } from "@application/use-cases/user/update-user.use-case";
import { DeleteUserUseCase } from "@application/use-cases/user/delete-user.use-case";

export interface UserRouteOptions {
  createUser: CreateUserUseCase;
  getUser: GetUserUseCase;
  updateUser: UpdateUserUseCase;
  deleteUser: DeleteUserUseCase;
}

export async function userRoutes(app: FastifyInstance, options: UserRouteOptions) {
  app.post("/users", async (request, reply) => {
    const { name, email, password } = request.body as { name: string; email: string; password: string };
    const output = await options.createUser.execute({ name, email, password });
    return reply.status(201).send(output);
  });

  app.get("/users/:id", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const output = await options.getUser.execute({ userId: id });
    return reply.status(200).send(output);
  });

  app.put("/users/:id", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { name?: string; email?: string; password?: string };
    const output = await options.updateUser.execute({ userId: id, ...body });
    return reply.status(200).send(output);
  });

  app.delete("/users/:id", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await options.deleteUser.execute({ userId: id });
    return reply.status(204).send();
  });
}
