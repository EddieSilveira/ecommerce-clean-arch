import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.middleware";
import { PlaceOrderUseCase } from "@application/use-cases/order/place-order.use-case";
import { GetOrderUseCase } from "@application/use-cases/order/get-order.use-case";
import { ListOrdersUseCase } from "@application/use-cases/order/list-orders.use-case";
import { CancelOrderUseCase } from "@application/use-cases/order/cancel-order.use-case";

export interface OrderRouteOptions {
  placeOrder: PlaceOrderUseCase;
  getOrder: GetOrderUseCase;
  listOrders: ListOrdersUseCase;
  cancelOrder: CancelOrderUseCase;
}

export async function orderRoutes(app: FastifyInstance, options: OrderRouteOptions) {
  app.post("/orders", { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user;
    const { items } = request.body as { items: { productId: string; quantity: number }[] };
    const output = await options.placeOrder.execute({ userId, items });
    return reply.status(201).send(output);
  });

  app.get("/orders", { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.user;
    const output = await options.listOrders.execute({ userId });
    return reply.status(200).send(output);
  });

  app.get("/orders/:id", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const output = await options.getOrder.execute({ orderId: id });
    return reply.status(200).send(output);
  });

  app.delete("/orders/:id", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await options.cancelOrder.execute({ orderId: id });
    return reply.status(204).send();
  });
}
