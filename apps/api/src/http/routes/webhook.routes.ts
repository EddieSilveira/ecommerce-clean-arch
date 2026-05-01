import { FastifyInstance } from "fastify";
import { ApprovePaymentUseCase } from "@application/use-cases/payment/approve-payment.use-case";
import { FailPaymentUseCase } from "@application/use-cases/payment/fail-payment.use-case";

export interface WebhookRouteOptions {
  approvePayment: ApprovePaymentUseCase;
  failPayment: FailPaymentUseCase;
}

export async function webhookRoutes(app: FastifyInstance, options: WebhookRouteOptions) {
  app.post<{ Params: { id: string } }>("/webhook/payments/:id/approve", {
    schema: { description: "Payment gateway webhook: approve payment" }
  }, async (request, reply) => {
    const { id } = request.params;
    await options.approvePayment.execute({ paymentId: id });
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>("/webhook/payments/:id/fail", {
    schema: { description: "Payment gateway webhook: fail payment" }
  }, async (request, reply) => {
    const { id } = request.params;
    await options.failPayment.execute({ paymentId: id });
    return reply.status(204).send();
  });
}
