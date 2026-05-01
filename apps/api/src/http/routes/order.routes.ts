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
  app.post<{ Body: { items: { productId: string; quantity: number }[] } }>("/orders", {
    preHandler: authenticate,
    schema: {
      description: "Place a new order (requires auth)",
      body: {
        type: "object",
        required: ["items"],
        properties: {
          items: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["productId", "quantity"],
              properties: {
                productId: { type: "string", format: "uuid" },
                quantity: { type: "integer", minimum: 1 }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { userId } = request.user;
    const { items } = request.body;
    const output = await options.placeOrder.execute({ userId, items });
    return reply.status(201).send(output);
  });

  app.get("/orders", {
    preHandler: authenticate,
    schema: { description: "List orders for the authenticated user" }
  }, async (request, reply) => {
    const { userId } = request.user;
    const output = await options.listOrders.execute({ userId });
    return reply.status(200).send(output);
  });

  app.get<{ Params: { id: string } }>("/orders/:id", {
    preHandler: authenticate,
    schema: { description: "Get order by ID (requires auth)" }
  }, async (request, reply) => {
    const { id } = request.params;
    const actor = { id: request.user.userId, role: request.user.role };
    const output = await options.getOrder.execute({ orderId: id, actor });
    return reply.status(200).send(output);
  });

  app.delete<{ Params: { id: string } }>("/orders/:id", {
    preHandler: authenticate,
    schema: { description: "Cancel an order (requires auth)" }
  }, async (request, reply) => {
    const { id } = request.params;
    const actor = { id: request.user.userId, role: request.user.role };
    await options.cancelOrder.execute({ orderId: id, actor });
    return reply.status(204).send();
  });
}
