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
  app.post("/payments", { preHandler: authenticate }, async (request, reply) => {
    const { orderId, amount } = request.body as { orderId: string; amount: number };
    const output = await options.processPayment.execute({ orderId, amount });
    return reply.status(201).send(output);
  });

  app.post("/payments/:id/approve", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await options.approvePayment.execute({ paymentId: id });
    return reply.status(204).send();
  });

  app.post("/payments/:id/fail", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await options.failPayment.execute({ paymentId: id });
    return reply.status(204).send();
  });
}
