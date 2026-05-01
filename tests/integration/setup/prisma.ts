import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env["DATABASE_URL_TEST"] ?? process.env["DATABASE_URL"]!;
const adapter = new PrismaPg({ connectionString });

export const prismaTest = new PrismaClient({ adapter });

export async function clearDatabase(): Promise<void> {
  await prismaTest.payment.deleteMany();
  await prismaTest.orderItem.deleteMany();
  await prismaTest.order.deleteMany();
  await prismaTest.user.deleteMany();
  await prismaTest.product.deleteMany();
}
