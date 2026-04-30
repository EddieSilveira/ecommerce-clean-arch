# Design: Use Cases Faltantes — Ecommerce Clean Arch

**Data:** 2026-04-30

## Contexto

O projeto já tem implementado domain layer completo (User, Product, Order, OrderItem, Payment) e application layer parcial (11 use cases). Esta spec cobre os use cases faltantes para completar a camada de aplicação antes de partir para infra.

## Escopo

### 1. Queries de leitura

Use cases simples de consulta por repositório, retornando DTOs primitivos.

| Use Case | Input | Output |
|---|---|---|
| `GetUserUseCase` | `userId: string` | `{ id, name, email }` |
| `GetProductUseCase` | `productId: string` | `{ id, name, price, stock }` |
| `GetOrderUseCase` | `orderId: string` | `{ id, userId, status, total, items[] }` |
| `ListOrdersUseCase` | `userId: string` | `Array<{ id, status, total }>` |

**Ajuste de porta necessário:** `IOrderRepository` ganha `findByUserId(userId: UUID): Promise<Order[]>`.

Todos lançam `Error("X not found")` quando não encontrado.

### 2. Ajuste no PlaceOrder + CancelOrder

**PlaceOrder** deixa de chamar `order.confirm()` internamente. O pedido sai em `PENDING`. A confirmação passa a ser responsabilidade de `ApprovePaymentUseCase`.

**CancelOrderUseCase:**
- Input: `orderId: string`
- Busca o pedido, lança erro se não encontrado
- Chama `order.cancel()` (a entidade já valida que só cancela se `PENDING`)
- Persiste via `IOrderRepository.save()`

### 3. Payment — nova porta + 3 use cases

**Nova porta `IPaymentRepository`:**
```ts
interface IPaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: UUID): Promise<Payment | null>;
  findByOrderId(orderId: UUID): Promise<Payment | null>;
}
```

**ProcessPaymentUseCase:**
- Input: `{ orderId: string, amount: number }`
- Valida que o pedido existe e está em `PENDING`
- Cria `Payment` via `Payment.create({ orderId, amount: Money.create(amount) })`
- Persiste e retorna `{ paymentId }`

**ApprovePaymentUseCase:**
- Input: `{ paymentId: string }`
- Busca payment, chama `payment.approve()`
- Busca order via `payment.getOrderId()`, chama `order.confirm()`
- Persiste ambos

**FailPaymentUseCase:**
- Input: `{ paymentId: string }`
- Busca payment, chama `payment.fail()`
- Busca order via `payment.getOrderId()`, chama `order.cancel()`
- Persiste ambos

## Estrutura de arquivos

```
application/
  ports/
    payment.repository.ts          (novo)
  use-cases/
    user/
      get-user.use-case.ts         (novo)
    product/
      get-product.use-case.ts      (novo)
    order/
      get-order.use-case.ts        (novo)
      list-orders.use-case.ts      (novo)
      cancel-order.use-case.ts     (novo)
      place-order.use-case.ts      (ajuste — remover order.confirm())
    payment/
      process-payment.use-case.ts  (novo)
      approve-payment.use-case.ts  (novo)
      fail-payment.use-case.ts     (novo)

tests/unit/use-cases/
  user/
    get-user.use-case.spec.ts
  product/
    get-product.use-case.spec.ts
  order/
    get-order.use-case.spec.ts
    list-orders.use-case.spec.ts
    cancel-order.use-case.spec.ts
    place-order.use-case.spec.ts   (ajuste nos testes existentes)
  payment/
    process-payment.use-case.spec.ts
    approve-payment.use-case.spec.ts
    fail-payment.use-case.spec.ts
```

## Fluxo Order-Payment

```
PlaceOrder → Order[PENDING]
     ↓
ProcessPayment → Payment[PENDING]
     ↓
ApprovePayment → Payment[PAID] + Order[CONFIRMED]
  ou
FailPayment    → Payment[FAILED] + Order[CANCELLED]
```

## Approach TDD

Para cada use case, na ordem:
1. Escrever spec com todos os cenários (happy path + erros)
2. Implementar o use case
3. Rodar testes e garantir verde
