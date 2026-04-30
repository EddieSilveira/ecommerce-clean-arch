import { FastifyInstance } from "fastify";
import { SignInUseCase } from "@application/use-cases/auth/sign-in.use-case";
import { ForgotPasswordUseCase } from "@application/use-cases/auth/forgot-password.use-case";
import { ResetPasswordUseCase } from "@application/use-cases/auth/reset-password.use-case";

export interface AuthRouteOptions {
  signIn: SignInUseCase;
  forgotPassword: ForgotPasswordUseCase;
  resetPassword: ResetPasswordUseCase;
}

export async function authRoutes(app: FastifyInstance, options: AuthRouteOptions) {
  app.post("/auth/sign-in", async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };
    const output = await options.signIn.execute({ email, password });
    return reply.status(200).send(output);
  });

  app.post("/auth/forgot-password", async (request, reply) => {
    const { email } = request.body as { email: string };
    await options.forgotPassword.execute({ email });
    return reply.status(204).send();
  });

  app.post("/auth/reset-password", async (request, reply) => {
    const { token, newPassword } = request.body as { token: string; newPassword: string };
    await options.resetPassword.execute({ token, newPassword });
    return reply.status(204).send();
  });
}
