import { app } from "@azure/functions";
import { handleRecommend } from "./core.mjs";
import { createServices } from "./services.mjs";

let services;
app.http("recommend", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      services ||= createServices(process.env, () => {});
    } catch {
      context.error("recommend_configuration_error");
      return { status: 503, headers: { "Cache-Control": "no-store" }, jsonBody: { error: { code: "configuration_error", message: "Live AI is not configured. Use Offline rules." } } };
    }
    const declaredLength = Number(request.headers.get("content-length"));
    if (declaredLength > 12000) {
      context.warn("recommend_body_too_large");
      return { status: 413, headers: { "Cache-Control": "no-store" }, jsonBody: { error: { code: "body_too_large", message: "Request body exceeds the allowed size." } } };
    }
    let bodyText = "";
    if (request.body) {
      const reader = request.body.getReader();
      const chunks = [];
      let size = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 12000) { await reader.cancel(); break; }
          chunks.push(value);
        }
        bodyText = size > 12000 ? " ".repeat(12001) : Buffer.concat(chunks).toString("utf8");
      } catch {
        context.warn("recommend_body_read_error");
        return { status: 400, headers: { "Cache-Control": "no-store" }, jsonBody: { error: { code: "body_read_error", message: "Could not read the request body." } } };
      }
    }
    return handleRecommend({
      method: request.method,
      origin: request.headers.get("origin"),
      authorization: request.headers.get("authorization"),
      contentType: request.headers.get("content-type"),
      bodyText
    }, { ...services, log: (event) => context.log(JSON.stringify(event)) });
  }
});
