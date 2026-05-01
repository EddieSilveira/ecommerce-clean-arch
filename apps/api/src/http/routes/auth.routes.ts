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
  app.post<{ Body: { email: string; password: string } }>("/auth/sign-in", {
    schema: {
      description: "Authenticate and receive a JWT token",
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body;
    const output = await options.signIn.execute({ email, password });
    return reply.status(200).send(output);
  });

  app.post<{ Body: { email: string } }>("/auth/forgot-password", {
    schema: {
      description: "Request a password reset token by email",
      body: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" }
        }
      }
    }
  }, async (request, reply) => {
    const { email } = request.body;
    await options.forgotPassword.execute({ email });
    return reply.status(204).send();
  });

  app.post<{ Body: { token: string; newPassword: string } }>("/auth/reset-password", {
    schema: {
      description: "Reset password using the token received by email",
      body: {
        type: "object",
        required: ["token", "newPassword"],
        properties: {
          token: { type: "string", minLength: 1 },
          newPassword: { type: "string", minLength: 1 }
        }
      }
    }
  }, async (request, reply) => {
    const { token, newPassword } = request.body;
    await options.resetPassword.execute({ token, newPassword });
    return reply.status(204).send();
  });
}
