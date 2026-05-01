import { Product } from "@domain/product/entities/product.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";
import { PaginationParams, PaginatedResult } from "./pagination";

export interface IProductRepository {
  findById(id: UUID): Promise<Product | null>;
  findAll(params: PaginationParams): Promise<PaginatedResult<Product>>;
  save(product: Product): Promise<void>;
  delete(productId: UUID): Promise<void>;
}
