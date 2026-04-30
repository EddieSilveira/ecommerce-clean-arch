import { IProductRepository } from "@application/ports/product.repository";
import { Product } from "@domain/product/entities/product.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";
import { PrismaClient } from "@prisma/client";

export class ProductPrismaRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UUID): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id: id.getValue() } });
    if (!row) return null;
    return Product.reconstruct({ id: row.id, name: row.name, price: Money.create(row.price.toNumber()), stock: row.stock });
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany();
    return rows.map(row =>
      Product.reconstruct({ id: row.id, name: row.name, price: Money.create(row.price.toNumber()), stock: row.stock })
    );
  }

  async save(product: Product): Promise<void> {
    await this.prisma.product.upsert({
      where: { id: product.getId().getValue() },
      create: {
        id: product.getId().getValue(),
        name: product.getName(),
        price: product.getPrice().getValue(),
        stock: product.getStock(),
      },
      update: {
        name: product.getName(),
        price: product.getPrice().getValue(),
        stock: product.getStock(),
      },
    });
  }

  async delete(productId: UUID): Promise<void> {
    await this.prisma.product.delete({ where: { id: productId.getValue() } });
  }
}
