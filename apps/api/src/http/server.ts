import Fastify, { FastifyInstance } from "fastify";
import fjwt from "@fastify/jwt";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { errorHandler } from "./middleware/error-handler";
import { healthRoutes } from "./routes/health.routes";
import { authRoutes, AuthRouteOptions } from "./routes/auth.routes";
import { userRoutes, UserRouteOptions } from "./routes/user.routes";
import { productRoutes, ProductRouteOptions } from "./routes/product.routes";
import { orderRoutes, OrderRouteOptions } from "./routes/order.routes";
import { paymentRoutes, PaymentRouteOptions } from "./routes/payment.routes";
import { webhookRoutes, WebhookRouteOptions } from "./routes/webhook.routes";

export interface ServerOptions {
  jwtSecret: string;
  allowedOrigins: string | string[];
  nodeEnv: string;
  auth: AuthRouteOptions;
  users: UserRouteOptions;
  products: ProductRouteOptions;
  orders: OrderRouteOptions;
  payments: PaymentRouteOptions;
  webhook: WebhookRouteOptions;
}

export function buildServer(options: ServerOptions): FastifyInstance {
  const app = Fastify({
    logger: options.nodeEnv === 'production'
      ? true
      : { transport: { target: 'pino-pretty' } },
    genReqId: () => crypto.randomUUID(),
  });

  app.register(cors, { origin: options.allowedOrigins });

  app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
  });

  app.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: { title: "Ecommerce API", version: "1.0.0" },
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
        }
      }
    }
  });

  app.register(swaggerUi, { routePrefix: "/docs" });
  app.register(fjwt, { secret: options.jwtSecret });
  app.setErrorHandler(errorHandler);

  app.register(healthRoutes);

  app.register(async (authPlugin) => {
    await authPlugin.register(rateLimit, {
      max: 10,
      timeWindow: '1 minute',
    });
    authPlugin.register(authRoutes, options.auth);
  });

  app.register(userRoutes, options.users);
  app.register(productRoutes, options.products);
  app.register(orderRoutes, options.orders);
  app.register(paymentRoutes, options.payments);
  app.register(webhookRoutes, options.webhook);

  return app;
}
