import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { API_ENABLED, API_PREFIX } from "../../helpers/env";
import { auth } from "./auth";
import { converters } from "./converters";
import { conversions } from "./conversions";
import { files } from "./files";
import { health } from "./health";
import { jobs } from "./jobs";
import { debug } from "./debug";
import { openapi } from "./openapi";

// Main API router with docs
export const api = new Elysia({
  prefix: API_PREFIX || "/api/v1",
  name: "api/v1",
})
  .use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
      exposeHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    })
  )
  // Custom OpenAPI documentation available at /api/v1/openapi
  // Note: Elysia swagger plugin has a composition bug that causes syntax errors
  // when used with CORS and other middleware. Using custom implementation instead.
  .onError(({ code, error, set }) => {
    console.error(`API Error [${code}]:`, error);
    
    switch (code) {
      case "NOT_FOUND":
        set.status = 404;
        return {
          success: false,
          error: "Endpoint not found",
          code: "NOT_FOUND",
        };
      case "VALIDATION":
        set.status = 400;
        return {
          success: false,
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.message,
        };
      case "INTERNAL_SERVER_ERROR":
        set.status = 500;
        return {
          success: false,
          error: "Internal server error",
          code: "INTERNAL_ERROR",
        };
      default:
        set.status = 500;
        return {
          success: false,
          error: "An unexpected error occurred",
          code: "UNKNOWN_ERROR",
        };
    }
  });

// Only mount API routes if API is enabled
if (API_ENABLED) {
  api
    .use(health)
    .use(auth)
    .use(converters)
    .use(conversions)
    .use(jobs)
    .use(files)
    .use(debug)
    .use(openapi);
}