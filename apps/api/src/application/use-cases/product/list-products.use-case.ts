import { IProductRepository } from "@application/ports/product.repository";

export interface ListProductsOutput {
  products: {
    productId: string;
    name: string;
    price: number;
    stock: number;
  }[];
}

export class ListProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<ListProductsOutput> {
    const products = await this.productRepository.findAll();

    return {
      products: products.map(p => ({
        productId: p.getId().getValue(),
        name: p.getName(),
        price: p.getPrice().getValue(),
        stock: p.getStock(),
      })),
    };
  }
}
