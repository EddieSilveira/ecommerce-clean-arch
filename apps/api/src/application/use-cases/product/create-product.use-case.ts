import { IProductRepository } from "@application/ports/product.repository";
import { Product } from "@domain/product/entities/product.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { Actor } from "@domain/shared/role";
import { UnauthorizedError } from "@domain/shared/errors/unauthorized.error";

export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
  actor: Actor;
}

export interface CreateProductOutput {
  productId: string;
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: CreateProductInput): Promise<CreateProductOutput> {
    if (input.actor.role !== 'ADMIN') throw new UnauthorizedError();

    const product = Product.create({
      name: input.name,
      price: Money.create(input.price),
      stock: input.stock,
    });

    await this.productRepository.save(product);
    return { productId: product.getId().getValue() };
  }
}
