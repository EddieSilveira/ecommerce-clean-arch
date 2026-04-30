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
  app.get("/products", async (request, reply) => {
    const output = await options.listProducts.execute();
    return reply.status(200).send(output);
  });

  app.get("/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const output = await options.getProduct.execute({ productId: id });
    return reply.status(200).send(output);
  });

  app.post("/products", { preHandler: authenticate }, async (request, reply) => {
    const { name, price, stock } = request.body as { name: string; price: number; stock: number };
    const output = await options.createProduct.execute({ name, price, stock });
    return reply.status(201).send(output);
  });

  app.put("/products/:id", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { name?: string; price?: number; stock?: number };
    const input: { productId: string; name?: string; price?: number; stock?: number } = { productId: id };
    if (body.name !== undefined) input.name = body.name;
    if (body.price !== undefined) input.price = body.price;
    if (body.stock !== undefined) input.stock = body.stock;
    const output = await options.updateProduct.execute(input);
    return reply.status(200).send(output);
  });

  app.delete("/products/:id", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await options.deleteProduct.execute({ productId: id });
    return reply.status(204).send();
  });
}
