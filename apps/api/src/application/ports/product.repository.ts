import { Product } from "@domain/product/entities/product.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface IProductRepository {
  findById(id: UUID): Promise<Product | null>;
  save(product: Product): Promise<void>;
}
