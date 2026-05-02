import { errorHandler } from "@http/middleware/error-handler";
import { NotFoundError } from "@domain/shared/errors/not-found.error";
import { ConflictError } from "@domain/shared/errors/conflict.error";
import { ForbiddenError } from "@domain/shared/errors/forbidden.error";

const makeReply = () => {
  const send = jest.fn();
  const status = jest.fn().mockReturnValue({ send });
  return { status, send };
};

describe("errorHandler", () => {
  it("should return 404 for NotFoundError regardless of message text", () => {
    const error = new NotFoundError("resource unavailable");
    const reply = makeReply();

    errorHandler(error as any, {} as any, reply as any);

    expect(reply.status).toHaveBeenCalledWith(404);
  });

  it("should return 409 for ConflictError regardless of message text", () => {
    const error = new ConflictError("duplicate entry");
    const reply = makeReply();

    errorHandler(error as any, {} as any, reply as any);

    expect(reply.status).toHaveBeenCalledWith(409);
  });

  it("should return 403 for ForbiddenError", () => {
    const error = new ForbiddenError();
    const reply = makeReply();

    errorHandler(error as any, {} as any, reply as any);

    expect(reply.status).toHaveBeenCalledWith(403);
  });
});
