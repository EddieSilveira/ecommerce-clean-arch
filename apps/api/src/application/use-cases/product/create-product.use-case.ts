import { IProductRepository } from "@application/ports/product.repository";
import { Product } from "@domain/product/entities/product.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { Actor } from "@domain/shared/role";
import { ForbiddenError } from "@domain/shared/errors/forbidden.error";

export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
  actor: Actor;
}

export interface CreateProductOutput {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: CreateProductInput): Promise<CreateProductOutput> {
    if (input.actor.role !== 'ADMIN') throw new ForbiddenError();

    const product = Product.create({
      name: input.name,
      price: Money.create(input.price),
      stock: input.stock,
    });

    await this.productRepository.save(product);
    return { id: product.getId().getValue(), name: product.getName(), price: product.getPrice().getValue(), stock: product.getStock() };
  }
}
