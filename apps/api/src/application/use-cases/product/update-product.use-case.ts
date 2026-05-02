import { IProductRepository } from "@application/ports/product.repository";
import { Money } from "@domain/shared/value-objects/money.vo";
import { Actor } from "@domain/shared/role";
import { ForbiddenError } from "@domain/shared/errors/forbidden.error";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface UpdateProductInput {
  productId: string;
  actor: Actor;
  name?: string;
  price?: number;
  stock?: number;
}

export interface UpdateProductOutput {
  productId: string;
}

export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: UpdateProductInput): Promise<UpdateProductOutput> {
    if (input.actor.role !== 'ADMIN') throw new ForbiddenError();

    const product = await this.productRepository.findById(UUID.create(input.productId));
    if (!product) throw new Error("Product not found");

    const updateProps: { name?: string; price?: Money; stock?: number } = {};
    if (input.name !== undefined) updateProps.name = input.name;
    if (input.price !== undefined) updateProps.price = Money.create(input.price);
    if (input.stock !== undefined) updateProps.stock = input.stock;

    product.update(updateProps);

    await this.productRepository.save(product);

    return { productId: product.getId().getValue() };
  }
}
