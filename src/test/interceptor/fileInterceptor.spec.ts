import { of } from "rxjs";
import { FormdataInterceptor } from "../../interceptors/formdata.interceptor";
import type { CallHandler, ExecutionContext } from "@nestjs/common";

describe("FormdataInterceptor", () => {
  let interceptor: FormdataInterceptor;

  const mockRequest = {
    headers: { "content-type": "multipart/form-data" },
    pipe: jest.fn(),
    body: {},
  };

  const executionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn().mockReturnValue(mockRequest),
  } as unknown as ExecutionContext;

  const next = {
    handle: jest.fn().mockReturnValue(of({})),
  } as unknown as CallHandler;

  beforeEach(() => {
    interceptor = new FormdataInterceptor();
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should call handleMultipartFormData if content type is multipart/form-data", async () => {
    const spy = jest
      .spyOn(interceptor as any, "handleMultipartFormData")
      .mockReturnValue(of({}));
    (await interceptor.intercept(executionContext, next)).subscribe();
    expect(spy).toHaveBeenCalled();
  });

  it("should not call handleMultipartFormData if content type is not multipart/form-data", async () => {
    mockRequest.headers = { "content-type": "application/json" };
    const spy = jest
      .spyOn(interceptor as any, "handleMultipartFormData")
      .mockReturnValue(of({}));
    (await interceptor.intercept(executionContext, next)).subscribe();
    expect(spy).not.toHaveBeenCalled();
  });

  it("should call next.handle if content type is not multipart/form-data", async () => {
    mockRequest.headers = { "content-type": "application/json" };
    (await interceptor.intercept(executionContext, next)).subscribe();
    expect(next.handle).toHaveBeenCalled();
  });

  it("should handle nested fields correctly", async () => {
    const target = {};
    const fieldName = "user[address][city]";
    const value = "New York";
    interceptor["handleField"](target, fieldName, value);

    expect(target).toEqual({
      user: {
        address: {
          city: "New York",
        },
      },
    });
  });

  it("should handle array fields correctly", async () => {
    const target = {};
    const fieldName = "tags[]";
    const value1 = "tag1";
    const value2 = "tag2";
    interceptor["handleField"](target, fieldName, value1);
    interceptor["handleField"](target, fieldName, value2);

    expect(target).toEqual({
      tags: ["tag1", "tag2"],
    });
  });
});
