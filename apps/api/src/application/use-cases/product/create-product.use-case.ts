import { IProductRepository } from "@application/ports/product.repository";
import { Product } from "@domain/product/entities/product.entity";
import { Money } from "@domain/shared/value-objects/money.vo";

export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
}

export interface CreateProductOutput {
  productId: string;
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(input: CreateProductInput): Promise<CreateProductOutput> {

    const product = Product.create({
      name: input.name,
      price: Money.create(input.price),
      stock: input.stock,
    });

    await this.productRepository.save(product);

    return { productId: product.getId().getValue() };
  }
}
