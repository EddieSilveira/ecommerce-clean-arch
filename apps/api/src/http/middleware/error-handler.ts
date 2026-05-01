import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (error.name === 'UnauthorizedError') {
    return reply.status(403).send({ error: error.message });
  }
  if (error.name === 'PaymentAmountMismatchError') {
    return reply.status(422).send({ error: error.message });
  }

  const message = error.message.toLowerCase();

  if (message.includes("not found")) {
    return reply.status(404).send({ error: error.message });
  }
  if (message.includes("already in use") || message.includes("already exists")) {
    return reply.status(409).send({ error: error.message });
  }
  if (
    message.includes("invalid") ||
    message.includes("cannot") ||
    message.includes("must") ||
    message.includes("empty") ||
    message.includes("negative") ||
    message.includes("pending") ||
    message.includes("insufficient")
  ) {
    return reply.status(400).send({ error: error.message });
  }

  console.error(error);
  return reply.status(500).send({ error: "Internal server error" });
}
