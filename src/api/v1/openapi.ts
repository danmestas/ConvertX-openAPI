import { Elysia } from "elysia";

export const openapi = new Elysia({ prefix: "/openapi" })
  .get("/", () => {
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ConvertX API - OpenAPI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script>
        window.onload = () => {
            window.ui = SwaggerUIBundle({
                url: '/api/v1/openapi/spec.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout"
            });
        };
    </script>
</body>
</html>`,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  })
  .get("/spec.json", () => {
    return {
      openapi: "3.0.0",
      info: {
        title: "ConvertX API",
        version: "1.0.0",
        description: "File conversion API supporting 1000+ formats",
        contact: {
          name: "ConvertX Support",
          email: "support@convertx.local",
        },
      },
      servers: [
        {
          url: "http://localhost:3110/api/v1",
          description: "Local development server",
        },
        {
          url: "https://convertx.example.com/api/v1",
          description: "Production server",
        },
      ],
      tags: [
        { name: "auth", description: "Authentication endpoints" },
        { name: "converters", description: "List available converters" },
        { name: "conversions", description: "File conversion operations" },
        { name: "jobs", description: "Job management" },
        { name: "files", description: "File operations" },
        { name: "health", description: "Health check" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT authentication token",
          },
          apiKey: {
            type: "apiKey",
            in: "header",
            name: "X-API-Key",
            description: "API key for programmatic access",
          },
        },
        schemas: {
          Error: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Error message" },
              code: { type: "string", example: "ERROR_CODE" },
            },
            required: ["success", "error"],
          },
          Success: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
            },
            required: ["success"],
          },
          User: {
            type: "object",
            properties: {
              id: { type: "integer" },
              email: { type: "string", format: "email" },
              created_at: { type: "string", format: "date-time" },
            },
          },
          Converter: {
            type: "object",
            properties: {
              name: { type: "string" },
              inputs: { type: "array", items: { type: "string" } },
              outputs: { type: "array", items: { type: "string" } },
            },
          },
          Job: {
            type: "object",
            properties: {
              id: { type: "integer" },
              user_id: { type: "integer" },
              file_name: { type: "string" },
              original_name: { type: "string" },
              mime_type: { type: "string" },
              file_size: { type: "integer" },
              converter: { type: "string" },
              format: { type: "string" },
              status: { type: "string", enum: ["pending", "completed", "failed"] },
              created_at: { type: "string", format: "date-time" },
            },
          },
        },
      },
      paths: {
        "/health": {
          get: {
            tags: ["health"],
            summary: "Health check",
            responses: {
              200: {
                description: "System health status",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Success",
                    },
                  },
                },
              },
            },
          },
        },
        "/auth/register": {
          post: {
            tags: ["auth"],
            summary: "Register new user",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      email: { type: "string", format: "email" },
                      password: { type: "string", minLength: 8 },
                    },
                    required: ["email", "password"],
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Registration successful",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Success",
                    },
                  },
                },
              },
              400: {
                description: "Bad request",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Error",
                    },
                  },
                },
              },
            },
          },
        },
        "/auth/login": {
          post: {
            tags: ["auth"],
            summary: "Login user",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      email: { type: "string", format: "email" },
                      password: { type: "string" },
                    },
                    required: ["email", "password"],
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Login successful",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: {
                          type: "object",
                          properties: {
                            user: { $ref: "#/components/schemas/User" },
                            token: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "/auth/me": {
          get: {
            tags: ["auth"],
            summary: "Get current user",
            security: [{ bearerAuth: [] }],
            responses: {
              200: {
                description: "Current user info",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: { $ref: "#/components/schemas/User" },
                      },
                    },
                  },
                },
              },
              401: {
                description: "Unauthorized",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Error",
                    },
                  },
                },
              },
            },
          },
        },
        "/converters": {
          get: {
            tags: ["converters"],
            summary: "List all converters",
            responses: {
              200: {
                description: "List of available converters",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: {
                          type: "object",
                          properties: {
                            converters: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Converter" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "/converters/{name}": {
          get: {
            tags: ["converters"],
            summary: "Get converter details",
            parameters: [
              {
                name: "name",
                in: "path",
                required: true,
                schema: { type: "string" },
                description: "Converter name",
              },
            ],
            responses: {
              200: {
                description: "Converter details",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: { $ref: "#/components/schemas/Converter" },
                      },
                    },
                  },
                },
              },
              404: {
                description: "Converter not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Error",
                    },
                  },
                },
              },
            },
          },
        },
        "/jobs": {
          get: {
            tags: ["jobs"],
            summary: "List user jobs",
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: "limit",
                in: "query",
                schema: { type: "integer", default: 50 },
                description: "Number of jobs to return",
              },
              {
                name: "offset",
                in: "query",
                schema: { type: "integer", default: 0 },
                description: "Number of jobs to skip",
              },
            ],
            responses: {
              200: {
                description: "List of user jobs",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: {
                          type: "object",
                          properties: {
                            jobs: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Job" },
                            },
                            total: { type: "integer" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "/conversions": {
          post: {
            tags: ["conversions"],
            summary: "Start file conversion",
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "multipart/form-data": {
                  schema: {
                    type: "object",
                    properties: {
                      file: {
                        type: "string",
                        format: "binary",
                        description: "File to convert",
                      },
                      converter: {
                        type: "string",
                        description: "Converter to use",
                      },
                      format: {
                        type: "string",
                        description: "Target format",
                      },
                    },
                    required: ["file", "converter", "format"],
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Conversion started",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: {
                          type: "object",
                          properties: {
                            jobId: { type: "integer" },
                            message: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  });