import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.middleware";
import { CreateProductUseCase } from "@application/use-cases/product/create-product.use-case";
import { GetProductUseCase } from "@application/use-cases/product/get-product.use-case";
import { UpdateProductUseCase } from "@application/use-cases/product/update-product.use-case";
import { DeleteProductUseCase } from "@application/use-cases/product/delete-product.use-case";
import { ListProductsUseCase } from "@application/use-cases/product/list-products.use-case";

export interface ProductRouteOptions {
  createProduct: CreateProductUseCase;
  getProduct: GetProductUseCase;
  updateProduct: UpdateProductUseCase;
  deleteProduct: DeleteProductUseCase;
  listProducts: ListProductsUseCase;
}

export async function productRoutes(app: FastifyInstance, options: ProductRouteOptions) {
  app.get<{ Querystring: { cursor?: string; limit?: number } }>("/products", {
    schema: {
      description: "List all products",
      querystring: {
        type: "object",
        properties: {
          cursor: { type: "string" },
          limit: { type: "integer", minimum: 1, maximum: 100 },
        },
      },
    },
  }, async (request, reply) => {
    const { cursor, limit } = request.query;
    const output = await options.listProducts.execute({ cursor, limit });
    return reply.status(200).send(output);
  });

  app.get<{ Params: { id: string } }>("/products/:id", {
    schema: { description: "Get product by ID" }
  }, async (request, reply) => {
    const { id } = request.params;
    const output = await options.getProduct.execute({ productId: id });
    return reply.status(200).send(output);
  });

  app.post<{ Body: { name: string; price: number; stock: number } }>("/products", {
    preHandler: authenticate,
    schema: {
      description: "Create a product (requires auth, ADMIN only)",
      body: {
        type: "object",
        required: ["name", "price", "stock"],
        properties: {
          name: { type: "string", minLength: 1 },
          price: { type: "number", minimum: 0 },
          stock: { type: "integer", minimum: 0 }
        }
      }
    }
  }, async (request, reply) => {
    const actor = { id: request.user.userId, role: request.user.role };
    const { name, price, stock } = request.body;
    const output = await options.createProduct.execute({ name, price, stock, actor });
    return reply.status(201).send(output);
  });

  app.put<{ Params: { id: string }; Body: { name?: string; price?: number; stock?: number } }>("/products/:id", {
    preHandler: authenticate,
    schema: {
      description: "Update a product (requires auth, ADMIN only)",
      body: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
          price: { type: "number", minimum: 0 },
          stock: { type: "integer", minimum: 0 }
        },
        minProperties: 1
      }
    }
  }, async (request, reply) => {
    const actor = { id: request.user.userId, role: request.user.role };
    const { id } = request.params;
    const { name, price, stock } = request.body;
    const input: { productId: string; actor: typeof actor; name?: string; price?: number; stock?: number } = { productId: id, actor };
    if (name !== undefined) input.name = name;
    if (price !== undefined) input.price = price;
    if (stock !== undefined) input.stock = stock;
    const output = await options.updateProduct.execute(input);
    return reply.status(200).send(output);
  });

  app.delete<{ Params: { id: string } }>("/products/:id", {
    preHandler: authenticate,
    schema: { description: "Delete a product (requires auth, ADMIN only)" }
  }, async (request, reply) => {
    const actor = { id: request.user.userId, role: request.user.role };
    const { id } = request.params;
    await options.deleteProduct.execute({ productId: id, actor });
    return reply.status(204).send();
  });
}
