import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.middleware";
import { ProcessPaymentUseCase } from "@application/use-cases/payment/process-payment.use-case";

export interface PaymentRouteOptions {
  processPayment: ProcessPaymentUseCase;
}

export async function paymentRoutes(app: FastifyInstance, options: PaymentRouteOptions) {
  app.post<{ Body: { orderId: string; amount: number } }>("/payments", {
    preHandler: authenticate,
    schema: {
      description: "Process a payment for an order (requires auth)",
      body: {
        type: "object",
        required: ["orderId", "amount"],
        properties: {
          orderId: { type: "string", format: "uuid" },
          amount: { type: "number", minimum: 0.01 }
        }
      }
    }
  }, async (request, reply) => {
    const { orderId, amount } = request.body;
    const actor = { id: request.user.userId, role: request.user.role };
    const output = await options.processPayment.execute({ orderId, amount, actor });
    return reply.status(201).send(output);
  });
}
