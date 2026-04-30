import Fastify, { FastifyInstance } from "fastify";
import fjwt from "@fastify/jwt";
import { errorHandler } from "./middleware/error-handler";
import { authRoutes, AuthRouteOptions } from "./routes/auth.routes";
import { userRoutes, UserRouteOptions } from "./routes/user.routes";
import { productRoutes, ProductRouteOptions } from "./routes/product.routes";
import { orderRoutes, OrderRouteOptions } from "./routes/order.routes";
import { paymentRoutes, PaymentRouteOptions } from "./routes/payment.routes";

export interface ServerOptions {
  jwtSecret: string;
  auth: AuthRouteOptions;
  users: UserRouteOptions;
  products: ProductRouteOptions;
  orders: OrderRouteOptions;
  payments: PaymentRouteOptions;
}

export function buildServer(options: ServerOptions): FastifyInstance {
  const app = Fastify({ logger: true });

  app.register(fjwt, { secret: options.jwtSecret });
  app.setErrorHandler(errorHandler);

  app.register(authRoutes, options.auth);
  app.register(userRoutes, options.users);
  app.register(productRoutes, options.products);
  app.register(orderRoutes, options.orders);
  app.register(paymentRoutes, options.payments);

  return app;
}
