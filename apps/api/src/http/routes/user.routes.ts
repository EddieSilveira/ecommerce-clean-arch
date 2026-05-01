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
  app.post<{ Body: { name: string; email: string; password: string } }>("/users", {
    schema: {
      description: "Create a new user account",
      body: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 1 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 }
        }
      }
    }
  }, async (request, reply) => {
    const { name, email, password } = request.body;
    const output = await options.createUser.execute({ name, email, password });
    return reply.status(201).send(output);
  });

  app.get<{ Params: { id: string } }>("/users/:id", {
    preHandler: authenticate,
    schema: { description: "Get user by ID (requires auth)" }
  }, async (request, reply) => {
    const { id } = request.params;
    const output = await options.getUser.execute({ userId: id });
    return reply.status(200).send(output);
  });

  app.put<{ Params: { id: string }; Body: { name?: string; email?: string; password?: string } }>("/users/:id", {
    preHandler: authenticate,
    schema: {
      description: "Update user (requires auth)",
      body: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 }
        },
        minProperties: 1
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { name, email, password } = request.body;
    const input: { userId: string; name?: string; email?: string; password?: string } = { userId: id };
    if (name !== undefined) input.name = name;
    if (email !== undefined) input.email = email;
    if (password !== undefined) input.password = password;
    const output = await options.updateUser.execute(input);
    return reply.status(200).send(output);
  });

  app.delete<{ Params: { id: string } }>("/users/:id", {
    preHandler: authenticate,
    schema: { description: "Delete user (requires auth)" }
  }, async (request, reply) => {
    const { id } = request.params;
    await options.deleteUser.execute({ userId: id });
    return reply.status(204).send();
  });
}
