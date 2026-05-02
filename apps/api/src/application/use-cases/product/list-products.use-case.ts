import { IProductRepository } from "@application/ports/product.repository";

export interface ListProductsInput {
  cursor?: string | undefined;
  limit?: number | undefined;
}

export interface ListProductsOutput {
  products: {
    id: string;
    name: string;
    price: number;
    stock: number;
  }[];
  nextCursor: string | null;
}

export class ListProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: ListProductsInput = {}): Promise<ListProductsOutput> {
    const limit = input.limit ?? 20;
    const { items, nextCursor } = await this.productRepository.findAll({
      cursor: input.cursor,
      limit,
    });

    return {
      products: items.map(p => ({
        id: p.getId().getValue(),
        name: p.getName(),
        price: p.getPrice().getValue(),
        stock: p.getStock(),
      })),
      nextCursor,
    };
  }
}
