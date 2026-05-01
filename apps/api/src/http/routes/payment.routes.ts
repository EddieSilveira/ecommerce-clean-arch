import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.middleware";
import { ProcessPaymentUseCase } from "@application/use-cases/payment/process-payment.use-case";
import { ApprovePaymentUseCase } from "@application/use-cases/payment/approve-payment.use-case";
import { FailPaymentUseCase } from "@application/use-cases/payment/fail-payment.use-case";

export interface PaymentRouteOptions {
  processPayment: ProcessPaymentUseCase;
  approvePayment: ApprovePaymentUseCase;
  failPayment: FailPaymentUseCase;
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
    const output = await options.processPayment.execute({ orderId, amount });
    return reply.status(201).send(output);
  });

  app.post<{ Params: { id: string } }>("/payments/:id/approve", {
    preHandler: authenticate,
    schema: { description: "Approve a pending payment (requires auth)" }
  }, async (request, reply) => {
    const { id } = request.params;
    await options.approvePayment.execute({ paymentId: id });
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>("/payments/:id/fail", {
    preHandler: authenticate,
    schema: { description: "Fail a pending payment (requires auth)" }
  }, async (request, reply) => {
    const { id } = request.params;
    await options.failPayment.execute({ paymentId: id });
    return reply.status(204).send();
  });
}
