import "dotenv/config";
import { env } from "./env";
import { prisma } from "@infra/database/prisma.client";
import { UserPrismaRepository } from "@infra/repositories/user.repository";
import { ProductPrismaRepository } from "@infra/repositories/product.repository";
import { OrderPrismaRepository } from "@infra/repositories/order.repository";
import { PaymentPrismaRepository } from "@infra/repositories/payment.repository";
import { BcryptHasher } from "@infra/services/bcrypt-hasher";
import { JwtTokenProvider } from "@infra/services/jwt-token-provider";
import { CryptoTokenGenerator } from "@infra/services/crypto-token-generator";
import { NodemailerEmailNotifier } from "@infra/services/nodemailer-email-notifier";
import { SignInUseCase } from "@application/use-cases/auth/sign-in.use-case";
import { ForgotPasswordUseCase } from "@application/use-cases/auth/forgot-password.use-case";
import { ResetPasswordUseCase } from "@application/use-cases/auth/reset-password.use-case";
import { CreateUserUseCase } from "@application/use-cases/user/create-user.use-case";
import { GetUserUseCase } from "@application/use-cases/user/get-user.use-case";
import { UpdateUserUseCase } from "@application/use-cases/user/update-user.use-case";
import { DeleteUserUseCase } from "@application/use-cases/user/delete-user.use-case";
import { CreateProductUseCase } from "@application/use-cases/product/create-product.use-case";
import { GetProductUseCase } from "@application/use-cases/product/get-product.use-case";
import { UpdateProductUseCase } from "@application/use-cases/product/update-product.use-case";
import { DeleteProductUseCase } from "@application/use-cases/product/delete-product.use-case";
import { ListProductsUseCase } from "@application/use-cases/product/list-products.use-case";
import { PlaceOrderUseCase } from "@application/use-cases/order/place-order.use-case";
import { GetOrderUseCase } from "@application/use-cases/order/get-order.use-case";
import { ListOrdersUseCase } from "@application/use-cases/order/list-orders.use-case";
import { CancelOrderUseCase } from "@application/use-cases/order/cancel-order.use-case";
import { ProcessPaymentUseCase } from "@application/use-cases/payment/process-payment.use-case";
import { ApprovePaymentUseCase } from "@application/use-cases/payment/approve-payment.use-case";
import { FailPaymentUseCase } from "@application/use-cases/payment/fail-payment.use-case";
import { buildServer } from "@http/server";

async function main() {
  const userRepo = new UserPrismaRepository(prisma);
  const productRepo = new ProductPrismaRepository(prisma);
  const orderRepo = new OrderPrismaRepository(prisma);
  const paymentRepo = new PaymentPrismaRepository(prisma);

  const hasher = new BcryptHasher();
  const tokenProvider = new JwtTokenProvider(env.JWT_SECRET, env.JWT_EXPIRES_IN);
  const tokenGenerator = new CryptoTokenGenerator();
  const emailNotifier = new NodemailerEmailNotifier({
    host: env.SMTP_HOST ?? '',
    port: env.SMTP_PORT,
    user: env.SMTP_USER ?? '',
    pass: env.SMTP_PASS ?? '',
    from: env.SMTP_FROM ?? '',
  });

  const signIn = new SignInUseCase(userRepo, hasher, tokenProvider);
  const forgotPassword = new ForgotPasswordUseCase(userRepo, tokenGenerator, emailNotifier);
  const resetPassword = new ResetPasswordUseCase(userRepo, hasher);
  const createUser = new CreateUserUseCase(userRepo, hasher);
  const getUser = new GetUserUseCase(userRepo);
  const updateUser = new UpdateUserUseCase(userRepo, hasher);
  const deleteUser = new DeleteUserUseCase(userRepo);
  const createProduct = new CreateProductUseCase(productRepo);
  const getProduct = new GetProductUseCase(productRepo);
  const updateProduct = new UpdateProductUseCase(productRepo);
  const deleteProduct = new DeleteProductUseCase(productRepo);
  const listProducts = new ListProductsUseCase(productRepo);
  const placeOrder = new PlaceOrderUseCase(userRepo, productRepo, orderRepo);
  const getOrder = new GetOrderUseCase(orderRepo);
  const listOrders = new ListOrdersUseCase(orderRepo);
  const cancelOrder = new CancelOrderUseCase(orderRepo);
  const processPayment = new ProcessPaymentUseCase(orderRepo, paymentRepo);
  const approvePayment = new ApprovePaymentUseCase(paymentRepo, orderRepo);
  const failPayment = new FailPaymentUseCase(paymentRepo, orderRepo);

  const server = buildServer({
    jwtSecret: env.JWT_SECRET,
    auth: { signIn, forgotPassword, resetPassword },
    users: { createUser, getUser, updateUser, deleteUser },
    products: { createProduct, getProduct, updateProduct, deleteProduct, listProducts },
    orders: { placeOrder, getOrder, listOrders, cancelOrder },
    payments: { processPayment, approvePayment, failPayment },
  });

  await server.listen({ port: env.PORT, host: "0.0.0.0" });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
