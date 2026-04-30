import { IProductRepository } from "@application/ports/product.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface GetProductInput {
  productId: string;
}

export interface GetProductOutput {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export class GetProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: GetProductInput): Promise<GetProductOutput> {
    const product = await this.productRepository.findById(UUID.create(input.productId));
    if (!product) throw new Error("Product not found");

    return {
      id: product.getId().getValue(),
      name: product.getName(),
      price: product.getPrice().getValue(),
      stock: product.getStock(),
    };
  }
}
