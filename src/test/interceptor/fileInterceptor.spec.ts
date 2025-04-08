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

  it("should handle form with optional file upload", async () => {
    const boundary = "d1bf46b3-aa33-4061-b28d-6c5ced8b08ee";
    mockRequest.headers = {
      "content-type": `multipart/form-data; boundary=${boundary}`,
    };
    mockRequest.body = [
      "\r\n--d1bf46b3-aa33-4061-b28d-6c5ced8b08ee\r\n",
      "Content-Type: application/octet-stream\r\n" +
        'Content-Disposition: form-data; name=batch-1; filename=""' +
        "\r\n\r\n",
      "\r\n--d1bf46b3-aa33-4061-b28d-6c5ced8b08ee--",
    ];
    // @ts-ignore
    mockRequest.pipe = (busboy) => {
      // @ts-ignore
      for (const src of mockRequest.body) {
        const buf = typeof src === "string" ? Buffer.from(src, "utf8") : src;
        busboy.write(buf);
      }
    };
    const observer = {
      next: (x) => console.log("Observer got a next value: " + x),
      error: (err) => console.error("Observer got an error: " + err),
      complete: () => console.log("Observer got a complete notification"),
    };

    (await interceptor.intercept(executionContext, next)).subscribe();
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
