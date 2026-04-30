# Missing Use Cases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar a camada de aplicação com use cases de leitura, cancelamento, ajuste no PlaceOrder e domínio de Payment completo.

**Architecture:** Cada use case recebe suas dependências por injeção de construtor via interfaces (ports). O fluxo Order-Payment segue: PlaceOrder cria pedido PENDING → ProcessPayment cria Payment PENDING → ApprovePayment confirma ambos / FailPayment cancela ambos.

**Tech Stack:** TypeScript, Jest (TDD), ts-jest, path aliases (`@application`, `@domain`, `@helpers`)

---

## File Map

**Criar:**
- `apps/api/src/application/ports/payment.repository.ts`
- `apps/api/src/application/use-cases/user/get-user.use-case.ts`
- `apps/api/src/application/use-cases/product/get-product.use-case.ts`
- `apps/api/src/application/use-cases/order/get-order.use-case.ts`
- `apps/api/src/application/use-cases/order/list-orders.use-case.ts`
- `apps/api/src/application/use-cases/order/cancel-order.use-case.ts`
- `apps/api/src/application/use-cases/payment/process-payment.use-case.ts`
- `apps/api/src/application/use-cases/payment/approve-payment.use-case.ts`
- `apps/api/src/application/use-cases/payment/fail-payment.use-case.ts`
- `tests/unit/use-cases/user/get-user.use-case.spec.ts`
- `tests/unit/use-cases/product/get-product.use-case.spec.ts`
- `tests/unit/use-cases/order/get-order.use-case.spec.ts`
- `tests/unit/use-cases/order/list-orders.use-case.spec.ts`
- `tests/unit/use-cases/order/cancel-order.use-case.spec.ts`
- `tests/unit/use-cases/payment/process-payment.use-case.spec.ts`
- `tests/unit/use-cases/payment/approve-payment.use-case.spec.ts`
- `tests/unit/use-cases/payment/fail-payment.use-case.spec.ts`

**Modificar:**
- `apps/api/src/application/ports/order.repository.ts` — adicionar `findByUserId`
- `apps/api/src/domain/order/entities/order.entity.ts` — adicionar `getUserId()`
- `apps/api/src/application/use-cases/order/place-order.use-case.ts` — remover `order.confirm()`
- `tests/helpers/fakes.ts` — atualizar `fakeOrderRepository` + corrigir `fakeProductRepository` + adicionar `fakePaymentRepository`
- `tests/unit/use-cases/place-order.use-case.spec.ts` — ajustar testes para pedido PENDING

---

## Task 1: Adicionar `getUserId()` na Order entity e `findByUserId` no IOrderRepository

**Files:**
- Modify: `apps/api/src/domain/order/entities/order.entity.ts`
- Modify: `apps/api/src/application/ports/order.repository.ts`

- [ ] **Step 1: Adicionar getter `getUserId()` na Order entity**

Em `apps/api/src/domain/order/entities/order.entity.ts`, adicionar após `getId()`:

```ts
getUserId(): UUID { return this.userId }
```

- [ ] **Step 2: Adicionar `findByUserId` no IOrderRepository**

Substituir o conteúdo de `apps/api/src/application/ports/order.repository.ts`:

```ts
import { Order } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: UUID): Promise<Order | null>;
  findByUserId(userId: UUID): Promise<Order[]>;
}
```

- [ ] **Step 3: Rodar testes para garantir que nada quebrou**

```bash
nvm use 22 && npm test
```

Expected: 143 passed, 0 failed

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/domain/order/entities/order.entity.ts apps/api/src/application/ports/order.repository.ts
git commit -m "feat: add getUserId to Order entity and findByUserId to IOrderRepository"
```

---

## Task 2: Criar `IPaymentRepository` port

**Files:**
- Create: `apps/api/src/application/ports/payment.repository.ts`

- [ ] **Step 1: Criar o arquivo**

```ts
import { Payment } from "@domain/payment/payment.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface IPaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: UUID): Promise<Payment | null>;
  findByOrderId(orderId: UUID): Promise<Payment | null>;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/application/ports/payment.repository.ts
git commit -m "feat: add IPaymentRepository port"
```

---

## Task 3: Atualizar fakes.ts

**Files:**
- Modify: `tests/helpers/fakes.ts`

- [ ] **Step 1: Substituir o conteúdo completo de `tests/helpers/fakes.ts`**

```ts
import { IHasher } from "@application/ports/hasher";
import { IOrderRepository } from "@application/ports/order.repository";
import { IPaymentRepository } from "@application/ports/payment.repository";
import { IProductRepository } from "@application/ports/product.repository";
import { IUserRepository } from "@application/ports/user.repository";
import { ITokenProvider } from "@application/ports/token-provider";
import { ITokenGenerator } from "@application/ports/token-generator";
import { IEmailNotifier } from "@application/ports/email-notifier";
import { Order } from "@domain/order/entities/order.entity";
import { Payment } from "@domain/payment/payment.entity";
import { Product } from "@domain/product/entities/product.entity";
import { User } from "@domain/user/entities/user.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export function fakeUserRepository(users: User[] = []): IUserRepository {
  return {
    findById: async (id: UUID) => users.find(u => u.getId().equals(id)) ?? null,
    findByEmail: async (email: string) => users.find(u => u.getEmail() === email) ?? null,
    findByResetToken: async (token: string) => users.find(u => u.getResetToken() === token) ?? null,
    save: async (user: User) => {
      const index = users.findIndex(u => u.getId().equals(user.getId()));
      if (index !== -1) users[index] = user;
      else users.push(user);
    },
    delete: async (id: UUID) => {
      const index = users.findIndex(u => u.getId().equals(id));
      if (index !== -1) users.splice(index, 1);
    },
  };
}

export function fakeProductRepository(products: Product[] = []): IProductRepository {
  return {
    findById: async (id: UUID) => products.find(p => p.getId().equals(id)) ?? null,
    findAll: async () => [...products],
    save: async (product: Product) => {
      const index = products.findIndex(p => p.getId().equals(product.getId()));
      if (index !== -1) products[index] = product;
      else products.push(product);
    },
    delete: async (id: UUID) => {
      const index = products.findIndex(p => p.getId().equals(id));
      if (index !== -1) products.splice(index, 1);
    }
  };
}

export function fakeOrderRepository(orders: Order[] = []): IOrderRepository {
  return {
    findById: async (id: UUID) => orders.find(o => o.getId().equals(id)) ?? null,
    findByUserId: async (userId: UUID) => orders.filter(o => o.getUserId().equals(userId)),
    save: async (order: Order) => {
      const index = orders.findIndex(o => o.getId().equals(order.getId()));
      if (index !== -1) orders[index] = order;
      else orders.push(order);
    },
  };
}

export function fakePaymentRepository(payments: Payment[] = []): IPaymentRepository {
  return {
    findById: async (id: UUID) => payments.find(p => p.getId().equals(id)) ?? null,
    findByOrderId: async (orderId: UUID) => payments.find(p => p.getOrderId().equals(orderId)) ?? null,
    save: async (payment: Payment) => {
      const index = payments.findIndex(p => p.getId().equals(payment.getId()));
      if (index !== -1) payments[index] = payment;
      else payments.push(payment);
    },
  };
}

export function fakeHasher(): IHasher {
  return {
    hash: async (plain: string) => `hashed:${plain}`,
    compare: async (plain: string, hash: string) => hash === `hashed:${plain}`,
  };
}

export function fakeTokenProvider(): ITokenProvider {
  return {
    generate: (userId: string) => `token:${userId}`,
  };
}

export function fakeTokenGenerator(): ITokenGenerator {
  return {
    generate: () => "reset-token-abc123",
  };
}

export function fakeEmailNotifier(): IEmailNotifier & { sentEmails: Array<{ email: string; token: string }> } {
  const sentEmails: Array<{ email: string; token: string }> = [];
  return {
    sentEmails,
    sendPasswordReset: async (email: string, token: string) => {
      sentEmails.push({ email, token });
    },
  };
}
```

- [ ] **Step 2: Rodar testes**

```bash
nvm use 22 && npm test
```

Expected: 143 passed, 0 failed

- [ ] **Step 3: Commit**

```bash
git add tests/helpers/fakes.ts
git commit -m "feat: update fakes — add fakePaymentRepository, fix fakeProductRepository upsert, add findByUserId to fakeOrderRepository"
```

---

## Task 4: GetUserUseCase (TDD)

**Files:**
- Create: `tests/unit/use-cases/user/get-user.use-case.spec.ts`
- Create: `apps/api/src/application/use-cases/user/get-user.use-case.ts`

- [ ] **Step 1: Escrever o teste**

Criar `tests/unit/use-cases/user/get-user.use-case.spec.ts`:

```ts
import { GetUserUseCase } from "@application/use-cases/user/get-user.use-case";
import { fakeUserRepository } from "@helpers/fakes";
import { User } from "@domain/user/entities/user.entity";

const makeUser = () => User.create({ name: "John Doe", email: "john@example.com", passwordHash: "hashed_password" });

describe("GetUserUseCase", () => {
  it("should return user data by id", async () => {
    const user = makeUser();
    const useCase = new GetUserUseCase(fakeUserRepository([user]));

    const output = await useCase.execute({ userId: user.getId().getValue() });

    expect(output.id).toBe(user.getId().getValue());
    expect(output.name).toBe("John Doe");
    expect(output.email).toBe("john@example.com");
  });

  it("should throw if user is not found", async () => {
    const useCase = new GetUserUseCase(fakeUserRepository());

    await expect(
      useCase.execute({ userId: "00000000-0000-4000-8000-000000000001" })
    ).rejects.toThrow("User not found");
  });
});
```

- [ ] **Step 2: Rodar o teste para verificar que falha**

```bash
nvm use 22 && npm test tests/unit/use-cases/user/get-user.use-case.spec.ts
```

Expected: FAIL — "Cannot find module '@application/use-cases/user/get-user.use-case'"

- [ ] **Step 3: Implementar o use case**

Criar `apps/api/src/application/use-cases/user/get-user.use-case.ts`:

```ts
import { IUserRepository } from "@application/ports/user.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface GetUserInput {
  userId: string;
}

export interface GetUserOutput {
  id: string;
  name: string;
  email: string;
}

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetUserInput): Promise<GetUserOutput> {
    const user = await this.userRepository.findById(UUID.create(input.userId));
    if (!user) throw new Error("User not found");

    return {
      id: user.getId().getValue(),
      name: user.getName(),
      email: user.getEmail(),
    };
  }
}
```

- [ ] **Step 4: Rodar o teste para verificar que passa**

```bash
nvm use 22 && npm test tests/unit/use-cases/user/get-user.use-case.spec.ts
```

Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/application/use-cases/user/get-user.use-case.ts tests/unit/use-cases/user/get-user.use-case.spec.ts
git commit -m "feat: add GetUserUseCase with tests"
```

---

## Task 5: GetProductUseCase (TDD)

**Files:**
- Create: `tests/unit/use-cases/product/get-product.use-case.spec.ts`
- Create: `apps/api/src/application/use-cases/product/get-product.use-case.ts`

- [ ] **Step 1: Escrever o teste**

Criar `tests/unit/use-cases/product/get-product.use-case.spec.ts`:

```ts
import { GetProductUseCase } from "@application/use-cases/product/get-product.use-case";
import { fakeProductRepository } from "@helpers/fakes";
import { Product } from "@domain/product/entities/product.entity";
import { Money } from "@domain/shared/value-objects/money.vo";

const makeProduct = () => Product.create({ name: "T-Shirt", price: Money.create(50), stock: 10 });

describe("GetProductUseCase", () => {
  it("should return product data by id", async () => {
    const product = makeProduct();
    const useCase = new GetProductUseCase(fakeProductRepository([product]));

    const output = await useCase.execute({ productId: product.getId().getValue() });

    expect(output.id).toBe(product.getId().getValue());
    expect(output.name).toBe("T-Shirt");
    expect(output.price).toBe(50);
    expect(output.stock).toBe(10);
  });

  it("should throw if product is not found", async () => {
    const useCase = new GetProductUseCase(fakeProductRepository());

    await expect(
      useCase.execute({ productId: "00000000-0000-4000-8000-000000000001" })
    ).rejects.toThrow("Product not found");
  });
});
```

- [ ] **Step 2: Rodar o teste para verificar que falha**

```bash
nvm use 22 && npm test tests/unit/use-cases/product/get-product.use-case.spec.ts
```

Expected: FAIL — "Cannot find module '@application/use-cases/product/get-product.use-case'"

- [ ] **Step 3: Implementar o use case**

Criar `apps/api/src/application/use-cases/product/get-product.use-case.ts`:

```ts
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
```

- [ ] **Step 4: Rodar o teste para verificar que passa**

```bash
nvm use 22 && npm test tests/unit/use-cases/product/get-product.use-case.spec.ts
```

Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/application/use-cases/product/get-product.use-case.ts tests/unit/use-cases/product/get-product.use-case.spec.ts
git commit -m "feat: add GetProductUseCase with tests"
```

---

## Task 6: GetOrderUseCase (TDD)

**Files:**
- Create: `tests/unit/use-cases/order/get-order.use-case.spec.ts`
- Create: `apps/api/src/application/use-cases/order/get-order.use-case.ts`

- [ ] **Step 1: Escrever o teste**

Criar `tests/unit/use-cases/order/get-order.use-case.spec.ts`:

```ts
import { GetOrderUseCase } from "@application/use-cases/order/get-order.use-case";
import { fakeOrderRepository } from "@helpers/fakes";
import { Order } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";
import { Money } from "@domain/shared/value-objects/money.vo";

const makeOrder = () => {
  const userId = UUID.create();
  return Order.create({ userId });
};

describe("GetOrderUseCase", () => {
  it("should return order data by id", async () => {
    const order = makeOrder();
    const useCase = new GetOrderUseCase(fakeOrderRepository([order]));

    const output = await useCase.execute({ orderId: order.getId().getValue() });

    expect(output.id).toBe(order.getId().getValue());
    expect(output.userId).toBe(order.getUserId().getValue());
    expect(output.status).toBe("PENDING");
    expect(output.total).toBe(0);
    expect(output.items).toEqual([]);
  });

  it("should throw if order is not found", async () => {
    const useCase = new GetOrderUseCase(fakeOrderRepository());

    await expect(
      useCase.execute({ orderId: "00000000-0000-4000-8000-000000000001" })
    ).rejects.toThrow("Order not found");
  });
});
```

- [ ] **Step 2: Rodar o teste para verificar que falha**

```bash
nvm use 22 && npm test tests/unit/use-cases/order/get-order.use-case.spec.ts
```

Expected: FAIL — "Cannot find module '@application/use-cases/order/get-order.use-case'"

- [ ] **Step 3: Implementar o use case**

Criar `apps/api/src/application/use-cases/order/get-order.use-case.ts`:

```ts
import { IOrderRepository } from "@application/ports/order.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface GetOrderInput {
  orderId: string;
}

export interface GetOrderItemOutput {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface GetOrderOutput {
  id: string;
  userId: string;
  status: string;
  total: number;
  items: GetOrderItemOutput[];
}

export class GetOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: GetOrderInput): Promise<GetOrderOutput> {
    const order = await this.orderRepository.findById(UUID.create(input.orderId));
    if (!order) throw new Error("Order not found");

    return {
      id: order.getId().getValue(),
      userId: order.getUserId().getValue(),
      status: order.getStatus(),
      total: order.getTotal().getValue(),
      items: order.getItems().map(item => ({
        id: item.getId().getValue(),
        productId: item.getProductId().getValue(),
        productName: item.getProductName(),
        unitPrice: item.getUnitPrice().getValue(),
        quantity: item.getQuantity(),
        subtotal: item.getSubtotal().getValue(),
      })),
    };
  }
}
```

- [ ] **Step 4: Rodar o teste para verificar que passa**

```bash
nvm use 22 && npm test tests/unit/use-cases/order/get-order.use-case.spec.ts
```

Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/application/use-cases/order/get-order.use-case.ts tests/unit/use-cases/order/get-order.use-case.spec.ts
git commit -m "feat: add GetOrderUseCase with tests"
```

---

## Task 7: ListOrdersUseCase (TDD)

**Files:**
- Create: `tests/unit/use-cases/order/list-orders.use-case.spec.ts`
- Create: `apps/api/src/application/use-cases/order/list-orders.use-case.ts`

- [ ] **Step 1: Escrever o teste**

Criar `tests/unit/use-cases/order/list-orders.use-case.spec.ts`:

```ts
import { ListOrdersUseCase } from "@application/use-cases/order/list-orders.use-case";
import { fakeOrderRepository } from "@helpers/fakes";
import { Order } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

describe("ListOrdersUseCase", () => {
  it("should return all orders for a user", async () => {
    const userId = UUID.create();
    const order1 = Order.create({ userId });
    const order2 = Order.create({ userId });
    const otherOrder = Order.create({ userId: UUID.create() });

    const useCase = new ListOrdersUseCase(fakeOrderRepository([order1, order2, otherOrder]));

    const output = await useCase.execute({ userId: userId.getValue() });

    expect(output).toHaveLength(2);
    expect(output[0]!.id).toBe(order1.getId().getValue());
    expect(output[1]!.id).toBe(order2.getId().getValue());
  });

  it("should return empty array when user has no orders", async () => {
    const useCase = new ListOrdersUseCase(fakeOrderRepository());

    const output = await useCase.execute({ userId: "00000000-0000-4000-8000-000000000001" });

    expect(output).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar o teste para verificar que falha**

```bash
nvm use 22 && npm test tests/unit/use-cases/order/list-orders.use-case.spec.ts
```

Expected: FAIL — "Cannot find module '@application/use-cases/order/list-orders.use-case'"

- [ ] **Step 3: Implementar o use case**

Criar `apps/api/src/application/use-cases/order/list-orders.use-case.ts`:

```ts
import { IOrderRepository } from "@application/ports/order.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface ListOrdersInput {
  userId: string;
}

export interface ListOrdersItemOutput {
  id: string;
  status: string;
  total: number;
}

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: ListOrdersInput): Promise<ListOrdersItemOutput[]> {
    const orders = await this.orderRepository.findByUserId(UUID.create(input.userId));

    return orders.map(order => ({
      id: order.getId().getValue(),
      status: order.getStatus(),
      total: order.getTotal().getValue(),
    }));
  }
}
```

- [ ] **Step 4: Rodar o teste para verificar que passa**

```bash
nvm use 22 && npm test tests/unit/use-cases/order/list-orders.use-case.spec.ts
```

Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/application/use-cases/order/list-orders.use-case.ts tests/unit/use-cases/order/list-orders.use-case.spec.ts
git commit -m "feat: add ListOrdersUseCase with tests"
```

---

## Task 8: CancelOrderUseCase (TDD)

**Files:**
- Create: `tests/unit/use-cases/order/cancel-order.use-case.spec.ts`
- Create: `apps/api/src/application/use-cases/order/cancel-order.use-case.ts`

- [ ] **Step 1: Escrever o teste**

Criar `tests/unit/use-cases/order/cancel-order.use-case.spec.ts`:

```ts
import { CancelOrderUseCase } from "@application/use-cases/order/cancel-order.use-case";
import { fakeOrderRepository } from "@helpers/fakes";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makeOrder = () => Order.create({ userId: UUID.create() });

describe("CancelOrderUseCase", () => {
  it("should cancel a pending order", async () => {
    const order = makeOrder();
    const orders = [order];
    const useCase = new CancelOrderUseCase(fakeOrderRepository(orders));

    await useCase.execute({ orderId: order.getId().getValue() });

    expect(orders[0]!.getStatus()).toBe(OrderStatus.CANCELLED);
  });

  it("should throw if order is not found", async () => {
    const useCase = new CancelOrderUseCase(fakeOrderRepository());

    await expect(
      useCase.execute({ orderId: "00000000-0000-4000-8000-000000000001" })
    ).rejects.toThrow("Order not found");
  });

  it("should throw if order is already cancelled", async () => {
    const order = makeOrder();
    order.cancel();
    const useCase = new CancelOrderUseCase(fakeOrderRepository([order]));

    await expect(
      useCase.execute({ orderId: order.getId().getValue() })
    ).rejects.toThrow("Cannot cancel a cancelled order");
  });
});
```

- [ ] **Step 2: Rodar o teste para verificar que falha**

```bash
nvm use 22 && npm test tests/unit/use-cases/order/cancel-order.use-case.spec.ts
```

Expected: FAIL — "Cannot find module '@application/use-cases/order/cancel-order.use-case'"

- [ ] **Step 3: Implementar o use case**

Criar `apps/api/src/application/use-cases/order/cancel-order.use-case.ts`:

```ts
import { IOrderRepository } from "@application/ports/order.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface CancelOrderInput {
  orderId: string;
}

export class CancelOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: CancelOrderInput): Promise<void> {
    const order = await this.orderRepository.findById(UUID.create(input.orderId));
    if (!order) throw new Error("Order not found");

    order.cancel();
    await this.orderRepository.save(order);
  }
}
```

- [ ] **Step 4: Rodar o teste para verificar que passa**

```bash
nvm use 22 && npm test tests/unit/use-cases/order/cancel-order.use-case.spec.ts
```

Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/application/use-cases/order/cancel-order.use-case.ts tests/unit/use-cases/order/cancel-order.use-case.spec.ts
git commit -m "feat: add CancelOrderUseCase with tests"
```

---

## Task 9: Ajustar PlaceOrderUseCase — pedido sai PENDING

**Files:**
- Modify: `apps/api/src/application/use-cases/order/place-order.use-case.ts`
- Modify: `tests/unit/use-cases/place-order.use-case.spec.ts`

- [ ] **Step 1: Remover `order.confirm()` do PlaceOrderUseCase**

Substituir o conteúdo de `apps/api/src/application/use-cases/order/place-order.use-case.ts`:

```ts
import { IOrderRepository } from "@application/ports/order.repository";
import { IProductRepository } from "@application/ports/product.repository";
import { IUserRepository } from "@application/ports/user.repository";
import { Order } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface PlaceOrderInput {
  userId: string;
  items: { productId: string; quantity: number }[];
}

export interface PlaceOrderOutput {
  orderId: string;
  total: number;
}

export class PlaceOrderUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly productRepository: IProductRepository,
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
    const userId = UUID.create(input.userId);

    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const order = Order.create({ userId });

    for (const item of input.items) {
      const productId = UUID.create(item.productId);

      const product = await this.productRepository.findById(productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (!product.isAvailable()) throw new Error(`Product "${product.getName()}" is out of stock`);

      product.decreaseStock(item.quantity);

      order.addItem({
        productId,
        productName: product.getName(),
        unitPrice: product.getPrice(),
        quantity: item.quantity,
      });

      await this.productRepository.save(product);
    }

    await this.orderRepository.save(order);

    return {
      orderId: order.getId().getValue(),
      total: order.getTotal().getValue(),
    };
  }
}
```

- [ ] **Step 2: Ajustar os testes do PlaceOrderUseCase**

Substituir o conteúdo de `tests/unit/use-cases/place-order.use-case.spec.ts`:

```ts
import { PlaceOrderUseCase } from "@application/use-cases/order/place-order.use-case";
import { IOrderRepository } from "@application/ports/order.repository";
import { IProductRepository } from "@application/ports/product.repository";
import { IUserRepository } from "@application/ports/user.repository";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { Product } from "@domain/product/entities/product.entity";
import { User } from "@domain/user/entities/user.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makeUser = () => User.create({ name: "John Doe", email: "john@example.com", passwordHash: "hashed_password_123" });
const makeProduct = (stock = 10) =>
  Product.create({ name: "T-Shirt", price: Money.create(50), stock });

function makeRepositories(user: User, product: Product) {
  const savedOrders: Order[] = [];
  const savedProducts: Product[] = [];

  const userRepository: IUserRepository = {
    findById: async (id: UUID) => user.getId().equals(id) ? user : null,
    findByEmail: async () => null,
    findByResetToken: async () => null,
    save: async () => {},
    delete: async () => {},
  };

  const productRepository: IProductRepository = {
    findById: async (id: UUID) => product.getId().equals(id) ? product : null,
    findAll: async () => [],
    save: async (p: Product) => { savedProducts.push(p); },
    delete: async () => {},
  };

  const orderRepository: IOrderRepository = {
    save: async (order: Order) => { savedOrders.push(order); },
    findById: async () => null,
    findByUserId: async () => [],
  };

  return { userRepository, productRepository, orderRepository, savedOrders, savedProducts };
}

describe("PlaceOrderUseCase", () => {
  it("should place an order in PENDING status and decrease product stock", async () => {
    const user = makeUser();
    const product = makeProduct(10);
    const { userRepository, productRepository, orderRepository, savedOrders } =
      makeRepositories(user, product);

    const useCase = new PlaceOrderUseCase(userRepository, productRepository, orderRepository);

    const output = await useCase.execute({
      userId: user.getId().getValue(),
      items: [{ productId: product.getId().getValue(), quantity: 2 }],
    });

    expect(output.orderId).toBeDefined();
    expect(output.total).toBe(100);
    expect(product.getStock()).toBe(8);
    expect(savedOrders).toHaveLength(1);
    expect(savedOrders[0]!.getStatus()).toBe(OrderStatus.PENDING);
  });

  it("should throw if user is not found", async () => {
    const user = makeUser();
    const product = makeProduct();
    const { productRepository, orderRepository } = makeRepositories(user, product);

    const emptyUserRepository: IUserRepository = {
      findById: async () => null,
      findByEmail: async () => null,
      findByResetToken: async () => null,
      save: async () => {},
      delete: async () => {},
    };

    const useCase = new PlaceOrderUseCase(emptyUserRepository, productRepository, orderRepository);

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        items: [{ productId: product.getId().getValue(), quantity: 1 }],
      })
    ).rejects.toThrow("User not found");
  });

  it("should throw if product is not found", async () => {
    const user = makeUser();
    const product = makeProduct();
    const { userRepository, orderRepository } = makeRepositories(user, product);

    const emptyProductRepository: IProductRepository = {
      findById: async () => null,
      findAll: async () => [],
      save: async () => {},
      delete: async () => {},
    };

    const useCase = new PlaceOrderUseCase(userRepository, emptyProductRepository, orderRepository);

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        items: [{ productId: product.getId().getValue(), quantity: 1 }],
      })
    ).rejects.toThrow("not found");
  });

  it("should throw if product is out of stock", async () => {
    const user = makeUser();
    const product = makeProduct(0);
    const { userRepository, productRepository, orderRepository } = makeRepositories(user, product);

    const useCase = new PlaceOrderUseCase(userRepository, productRepository, orderRepository);

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        items: [{ productId: product.getId().getValue(), quantity: 1 }],
      })
    ).rejects.toThrow("out of stock");
  });

  it("should throw if quantity exceeds stock", async () => {
    const user = makeUser();
    const product = makeProduct(1);
    const { userRepository, productRepository, orderRepository } = makeRepositories(user, product);

    const useCase = new PlaceOrderUseCase(userRepository, productRepository, orderRepository);

    await expect(
      useCase.execute({
        userId: user.getId().getValue(),
        items: [{ productId: product.getId().getValue(), quantity: 5 }],
      })
    ).rejects.toThrow("Insufficient stock");
  });
});
```

- [ ] **Step 3: Rodar todos os testes**

```bash
nvm use 22 && npm test
```

Expected: todos os testes passando

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/application/use-cases/order/place-order.use-case.ts tests/unit/use-cases/place-order.use-case.spec.ts
git commit -m "feat: PlaceOrder now creates order in PENDING status — confirmation moved to ApprovePayment"
```

---

## Task 10: ProcessPaymentUseCase (TDD)

**Files:**
- Create: `tests/unit/use-cases/payment/process-payment.use-case.spec.ts`
- Create: `apps/api/src/application/use-cases/payment/process-payment.use-case.ts`

- [ ] **Step 1: Escrever o teste**

Criar `tests/unit/use-cases/payment/process-payment.use-case.spec.ts`:

```ts
import { ProcessPaymentUseCase } from "@application/use-cases/payment/process-payment.use-case";
import { fakeOrderRepository, fakePaymentRepository } from "@helpers/fakes";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { Payment, PaymentStatus } from "@domain/payment/payment.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makePendingOrder = () => Order.create({ userId: UUID.create() });

describe("ProcessPaymentUseCase", () => {
  it("should create a payment in PENDING status for a pending order", async () => {
    const order = makePendingOrder();
    const payments: Payment[] = [];
    const useCase = new ProcessPaymentUseCase(
      fakeOrderRepository([order]),
      fakePaymentRepository(payments)
    );

    const output = await useCase.execute({
      orderId: order.getId().getValue(),
      amount: 150,
    });

    expect(output.paymentId).toBeDefined();
    expect(payments).toHaveLength(1);
    expect(payments[0]!.getStatus()).toBe(PaymentStatus.PENDING);
    expect(payments[0]!.getAmount().getValue()).toBe(150);
  });

  it("should throw if order is not found", async () => {
    const useCase = new ProcessPaymentUseCase(
      fakeOrderRepository(),
      fakePaymentRepository()
    );

    await expect(
      useCase.execute({ orderId: "00000000-0000-4000-8000-000000000001", amount: 100 })
    ).rejects.toThrow("Order not found");
  });

  it("should throw if order is not in PENDING status", async () => {
    const order = makePendingOrder();
    order.cancel();
    const useCase = new ProcessPaymentUseCase(
      fakeOrderRepository([order]),
      fakePaymentRepository()
    );

    await expect(
      useCase.execute({ orderId: order.getId().getValue(), amount: 100 })
    ).rejects.toThrow("Order is not pending");
  });

  it("should throw if amount is zero or negative", async () => {
    const order = makePendingOrder();
    const useCase = new ProcessPaymentUseCase(
      fakeOrderRepository([order]),
      fakePaymentRepository()
    );

    await expect(
      useCase.execute({ orderId: order.getId().getValue(), amount: 0 })
    ).rejects.toThrow("Value cannot be negative");
  });
});
```

- [ ] **Step 2: Rodar o teste para verificar que falha**

```bash
nvm use 22 && npm test tests/unit/use-cases/payment/process-payment.use-case.spec.ts
```

Expected: FAIL — "Cannot find module '@application/use-cases/payment/process-payment.use-case'"

- [ ] **Step 3: Implementar o use case**

Criar `apps/api/src/application/use-cases/payment/process-payment.use-case.ts`:

```ts
import { IOrderRepository } from "@application/ports/order.repository";
import { IPaymentRepository } from "@application/ports/payment.repository";
import { Payment } from "@domain/payment/payment.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { OrderStatus } from "@domain/order/entities/order.entity";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface ProcessPaymentInput {
  orderId: string;
  amount: number;
}

export interface ProcessPaymentOutput {
  paymentId: string;
}

export class ProcessPaymentUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentRepository: IPaymentRepository
  ) {}

  async execute(input: ProcessPaymentInput): Promise<ProcessPaymentOutput> {
    const order = await this.orderRepository.findById(UUID.create(input.orderId));
    if (!order) throw new Error("Order not found");
    if (order.getStatus() !== OrderStatus.PENDING) throw new Error("Order is not pending");

    const payment = Payment.create({
      orderId: order.getId(),
      amount: Money.create(input.amount),
    });

    await this.paymentRepository.save(payment);

    return { paymentId: payment.getId().getValue() };
  }
}
```

- [ ] **Step 4: Rodar o teste para verificar que passa**

```bash
nvm use 22 && npm test tests/unit/use-cases/payment/process-payment.use-case.spec.ts
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/application/use-cases/payment/process-payment.use-case.ts tests/unit/use-cases/payment/process-payment.use-case.spec.ts
git commit -m "feat: add ProcessPaymentUseCase with tests"
```

---

## Task 11: ApprovePaymentUseCase (TDD)

**Files:**
- Create: `tests/unit/use-cases/payment/approve-payment.use-case.spec.ts`
- Create: `apps/api/src/application/use-cases/payment/approve-payment.use-case.ts`

- [ ] **Step 1: Escrever o teste**

Criar `tests/unit/use-cases/payment/approve-payment.use-case.spec.ts`:

```ts
import { ApprovePaymentUseCase } from "@application/use-cases/payment/approve-payment.use-case";
import { fakeOrderRepository, fakePaymentRepository } from "@helpers/fakes";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { Payment, PaymentStatus } from "@domain/payment/payment.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makePendingOrder = () => Order.create({ userId: UUID.create() });
const makePaymentFor = (order: Order) =>
  Payment.create({ orderId: order.getId(), amount: Money.create(100) });

describe("ApprovePaymentUseCase", () => {
  it("should approve payment and confirm order", async () => {
    const order = makePendingOrder();
    const payment = makePaymentFor(order);
    const orders = [order];
    const payments = [payment];

    const useCase = new ApprovePaymentUseCase(
      fakePaymentRepository(payments),
      fakeOrderRepository(orders)
    );

    await useCase.execute({ paymentId: payment.getId().getValue() });

    expect(payments[0]!.getStatus()).toBe(PaymentStatus.PAID);
    expect(orders[0]!.getStatus()).toBe(OrderStatus.CONFIRMED);
  });

  it("should throw if payment is not found", async () => {
    const useCase = new ApprovePaymentUseCase(
      fakePaymentRepository(),
      fakeOrderRepository()
    );

    await expect(
      useCase.execute({ paymentId: "00000000-0000-4000-8000-000000000001" })
    ).rejects.toThrow("Payment not found");
  });

  it("should throw if order is not found", async () => {
    const order = makePendingOrder();
    const payment = makePaymentFor(order);

    const useCase = new ApprovePaymentUseCase(
      fakePaymentRepository([payment]),
      fakeOrderRepository()
    );

    await expect(
      useCase.execute({ paymentId: payment.getId().getValue() })
    ).rejects.toThrow("Order not found");
  });

  it("should throw if payment is already approved", async () => {
    const order = makePendingOrder();
    const payment = makePaymentFor(order);
    payment.approve();

    const useCase = new ApprovePaymentUseCase(
      fakePaymentRepository([payment]),
      fakeOrderRepository([order])
    );

    await expect(
      useCase.execute({ paymentId: payment.getId().getValue() })
    ).rejects.toThrow("Only pending payments can be approved");
  });
});
```

- [ ] **Step 2: Rodar o teste para verificar que falha**

```bash
nvm use 22 && npm test tests/unit/use-cases/payment/approve-payment.use-case.spec.ts
```

Expected: FAIL — "Cannot find module '@application/use-cases/payment/approve-payment.use-case'"

- [ ] **Step 3: Implementar o use case**

Criar `apps/api/src/application/use-cases/payment/approve-payment.use-case.ts`:

```ts
import { IOrderRepository } from "@application/ports/order.repository";
import { IPaymentRepository } from "@application/ports/payment.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface ApprovePaymentInput {
  paymentId: string;
}

export class ApprovePaymentUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(input: ApprovePaymentInput): Promise<void> {
    const payment = await this.paymentRepository.findById(UUID.create(input.paymentId));
    if (!payment) throw new Error("Payment not found");

    const order = await this.orderRepository.findById(payment.getOrderId());
    if (!order) throw new Error("Order not found");

    payment.approve();
    order.confirm();

    await this.paymentRepository.save(payment);
    await this.orderRepository.save(order);
  }
}
```

- [ ] **Step 4: Rodar o teste para verificar que passa**

```bash
nvm use 22 && npm test tests/unit/use-cases/payment/approve-payment.use-case.spec.ts
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/application/use-cases/payment/approve-payment.use-case.ts tests/unit/use-cases/payment/approve-payment.use-case.spec.ts
git commit -m "feat: add ApprovePaymentUseCase with tests"
```

---

## Task 12: FailPaymentUseCase (TDD)

**Files:**
- Create: `tests/unit/use-cases/payment/fail-payment.use-case.spec.ts`
- Create: `apps/api/src/application/use-cases/payment/fail-payment.use-case.ts`

- [ ] **Step 1: Escrever o teste**

Criar `tests/unit/use-cases/payment/fail-payment.use-case.spec.ts`:

```ts
import { FailPaymentUseCase } from "@application/use-cases/payment/fail-payment.use-case";
import { fakeOrderRepository, fakePaymentRepository } from "@helpers/fakes";
import { Order, OrderStatus } from "@domain/order/entities/order.entity";
import { Payment, PaymentStatus } from "@domain/payment/payment.entity";
import { Money } from "@domain/shared/value-objects/money.vo";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

const makePendingOrder = () => Order.create({ userId: UUID.create() });
const makePaymentFor = (order: Order) =>
  Payment.create({ orderId: order.getId(), amount: Money.create(100) });

describe("FailPaymentUseCase", () => {
  it("should fail payment and cancel order", async () => {
    const order = makePendingOrder();
    const payment = makePaymentFor(order);
    const orders = [order];
    const payments = [payment];

    const useCase = new FailPaymentUseCase(
      fakePaymentRepository(payments),
      fakeOrderRepository(orders)
    );

    await useCase.execute({ paymentId: payment.getId().getValue() });

    expect(payments[0]!.getStatus()).toBe(PaymentStatus.FAILED);
    expect(orders[0]!.getStatus()).toBe(OrderStatus.CANCELLED);
  });

  it("should throw if payment is not found", async () => {
    const useCase = new FailPaymentUseCase(
      fakePaymentRepository(),
      fakeOrderRepository()
    );

    await expect(
      useCase.execute({ paymentId: "00000000-0000-4000-8000-000000000001" })
    ).rejects.toThrow("Payment not found");
  });

  it("should throw if order is not found", async () => {
    const order = makePendingOrder();
    const payment = makePaymentFor(order);

    const useCase = new FailPaymentUseCase(
      fakePaymentRepository([payment]),
      fakeOrderRepository()
    );

    await expect(
      useCase.execute({ paymentId: payment.getId().getValue() })
    ).rejects.toThrow("Order not found");
  });

  it("should throw if payment is already failed", async () => {
    const order = makePendingOrder();
    const payment = makePaymentFor(order);
    payment.fail();

    const useCase = new FailPaymentUseCase(
      fakePaymentRepository([payment]),
      fakeOrderRepository([order])
    );

    await expect(
      useCase.execute({ paymentId: payment.getId().getValue() })
    ).rejects.toThrow("Only pending payments can be failed");
  });
});
```

- [ ] **Step 2: Rodar o teste para verificar que falha**

```bash
nvm use 22 && npm test tests/unit/use-cases/payment/fail-payment.use-case.spec.ts
```

Expected: FAIL — "Cannot find module '@application/use-cases/payment/fail-payment.use-case'"

- [ ] **Step 3: Implementar o use case**

Criar `apps/api/src/application/use-cases/payment/fail-payment.use-case.ts`:

```ts
import { IOrderRepository } from "@application/ports/order.repository";
import { IPaymentRepository } from "@application/ports/payment.repository";
import { UUID } from "@domain/shared/value-objects/uuid.vo";

export interface FailPaymentInput {
  paymentId: string;
}

export class FailPaymentUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(input: FailPaymentInput): Promise<void> {
    const payment = await this.paymentRepository.findById(UUID.create(input.paymentId));
    if (!payment) throw new Error("Payment not found");

    const order = await this.orderRepository.findById(payment.getOrderId());
    if (!order) throw new Error("Order not found");

    payment.fail();
    order.cancel();

    await this.paymentRepository.save(payment);
    await this.orderRepository.save(order);
  }
}
```

- [ ] **Step 4: Rodar o teste para verificar que passa**

```bash
nvm use 22 && npm test tests/unit/use-cases/payment/fail-payment.use-case.spec.ts
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/application/use-cases/payment/fail-payment.use-case.ts tests/unit/use-cases/payment/fail-payment.use-case.spec.ts
git commit -m "feat: add FailPaymentUseCase with tests"
```

---

## Task 13: Verificação final

- [ ] **Step 1: Rodar todos os testes**

```bash
nvm use 22 && npm test
```

Expected: 18+ suites, todos passando, 0 failed

- [ ] **Step 2: Commit final se necessário**

```bash
git status
```

Se houver arquivos não commitados, commitar agora.
