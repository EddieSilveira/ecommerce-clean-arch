import { IProductRepository } from "@application/ports/product.repository";
import { Actor } from "@domain/shared/role";
import { ForbiddenError } from "@domain/shared/errors/forbidden.error";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface DeleteProductInput {
  productId: string;
  actor: Actor;
}

export interface DeleteProductOutput {
  success: boolean;
}

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: DeleteProductInput): Promise<DeleteProductOutput> {
    if (input.actor.role !== 'ADMIN') throw new ForbiddenError();

    const product = await this.productRepository.findById(UUID.create(input.productId));
    if (!product) throw new Error("Product not found");

    await this.productRepository.delete(product.getId());

    return { success: true };
  }
}
