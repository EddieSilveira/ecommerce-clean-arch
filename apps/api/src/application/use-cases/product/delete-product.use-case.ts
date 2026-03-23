import { IProductRepository } from "@application/ports/product.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface DeleteProductInput {
    productId: string;
}

export interface DeleteProductOutput {
    success: boolean
}

export class DeleteProductUseCase {
    constructor(
        private productRepository: IProductRepository
    ) { }

    async execute(input: DeleteProductInput): Promise<DeleteProductOutput> {
        const product = await this.productRepository.findById(UUID.create(input.productId));
        if (!product) throw new Error("Product not found");

        await this.productRepository.delete(product.getId());

        return {
            success: true
        }
    }
}