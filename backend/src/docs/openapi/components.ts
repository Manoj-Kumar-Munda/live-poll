export const components = {
  securitySchemes: {
    sessionCookie: {
      type: "apiKey",
      in: "cookie",
      name: "better-auth.session_token",
      description:
        "Session cookie issued by better-auth after sign-in. Use credentials: include in browser clients.",
    },
  },
  schemas: {
    ValidationErrorItem: {
      type: "object",
      required: ["path", "message"],
      properties: {
        path: { type: "string", example: "title" },
        message: { type: "string", example: "Title is required" },
      },
    },
    ApiErrorResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "integer", example: 400 },
        message: { type: "string", example: "Validation failed" },
        data: { nullable: true, example: null },
        errors: {
          type: "array",
          items: { $ref: "#/components/schemas/ValidationErrorItem" },
        },
      },
    },
    HealthResponse: {
      type: "object",
      required: ["status"],
      properties: {
        status: { type: "string", example: "ok" },
      },
    },
    User: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        email: { type: "string", format: "email" },
        role: { type: "string", enum: ["host", "participant"] },
        emailVerified: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    Session: {
      type: "object",
      properties: {
        id: { type: "string" },
        userId: { type: "string" },
        expiresAt: { type: "string", format: "date-time" },
      },
    },
    UserMeData: {
      type: "object",
      required: ["user", "session"],
      properties: {
        user: { $ref: "#/components/schemas/User" },
        session: { $ref: "#/components/schemas/Session" },
      },
    },
    UserMeResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        message: { type: "string", example: "User fetched" },
        data: { $ref: "#/components/schemas/UserMeData" },
      },
    },
    UpdateProfileRequest: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
          minLength: 1,
          maxLength: 100,
          example: "Alex Host",
        },
      },
    },
    UpdateProfileResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        message: { type: "string", example: "Profile updated" },
        data: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/User" },
          },
        },
      },
    },
    QuizStatus: {
      type: "string",
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
    },
    Quiz: {
      type: "object",
      required: [
        "id",
        "ownerId",
        "title",
        "description",
        "status",
        "pointsPerQuestion",
        "timeLimitSeconds",
        "questionCount",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        id: { type: "string", example: "674a1b2c3d4e5f6789012345" },
        ownerId: { type: "string" },
        title: { type: "string", example: "Weekly trivia" },
        description: { type: "string", nullable: true, example: null },
        status: { $ref: "#/components/schemas/QuizStatus" },
        pointsPerQuestion: { type: "integer", minimum: 1, example: 10 },
        timeLimitSeconds: { type: "integer", minimum: 5, example: 30 },
        questionCount: { type: "integer", minimum: 0, example: 0 },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    CreateQuizRequest: {
      type: "object",
      required: ["title"],
      properties: {
        title: {
          type: "string",
          minLength: 1,
          maxLength: 120,
          example: "Weekly trivia",
        },
        description: {
          type: "string",
          maxLength: 2000,
          example: "Friday night quiz for the team",
        },
        pointsPerQuestion: {
          type: "integer",
          minimum: 1,
          maximum: 1000,
          default: 10,
          example: 10,
        },
        timeLimitSeconds: {
          type: "integer",
          minimum: 5,
          maximum: 300,
          default: 30,
          example: 30,
        },
      },
    },
    CreateQuizResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 201 },
        message: { type: "string", example: "Quiz created" },
        data: {
          type: "object",
          required: ["quiz"],
          properties: {
            quiz: { $ref: "#/components/schemas/Quiz" },
          },
        },
      },
    },
    ListQuizzesResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        message: { type: "string", example: "Quizzes fetched" },
        data: {
          type: "object",
          required: ["quizzes"],
          properties: {
            quizzes: {
              type: "array",
              items: { $ref: "#/components/schemas/Quiz" },
            },
          },
        },
      },
    },
  },
  responses: {
    Unauthorized: {
      description: "Missing or invalid session",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiErrorResponse" },
          example: {
            success: false,
            statusCode: 401,
            message: "Unauthorized",
            data: null,
          },
        },
      },
    },
    Forbidden: {
      description: "Authenticated but not allowed for this route",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiErrorResponse" },
          example: {
            success: false,
            statusCode: 403,
            message: "Forbidden",
            data: null,
          },
        },
      },
    },
    ValidationError: {
      description: "Request body or query failed validation",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiErrorResponse" },
          example: {
            success: false,
            statusCode: 400,
            message: "Validation failed",
            data: null,
            errors: [{ path: "title", message: "Title is required" }],
          },
        },
      },
    },
  },
} as const;
