export const paths = {
  "/health": {
    get: {
      tags: ["Health"],
      summary: "Health check",
      description: "Returns plain JSON (not the ApiResponse envelope).",
      responses: {
        "200": {
          description: "Service is up",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HealthResponse" },
            },
          },
        },
      },
    },
  },
  "/api/users/me": {
    get: {
      tags: ["Users"],
      summary: "Get current user",
      security: [{ sessionCookie: [] }],
      responses: {
        "200": {
          description: "Current user and session",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserMeResponse" },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
      },
    },
    patch: {
      tags: ["Users"],
      summary: "Update current user profile",
      security: [{ sessionCookie: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateProfileRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Profile updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileResponse" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/api/quizzes": {
    get: {
      tags: ["Quizzes"],
      summary: "List host quizzes",
      description:
        "Host only. Returns quizzes owned by the current user. Optional `status` filter.",
      security: [{ sessionCookie: [] }],
      parameters: [
        {
          name: "status",
          in: "query",
          required: false,
          schema: { $ref: "#/components/schemas/QuizStatus" },
          description: "Filter by quiz status",
        },
      ],
      responses: {
        "200": {
          description: "Quizzes fetched",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ListQuizzesResponse" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
      },
    },
    post: {
      tags: ["Quizzes"],
      summary: "Create a draft quiz",
      description: "Host only. Creates a quiz in `DRAFT` status.",
      security: [{ sessionCookie: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateQuizRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "Quiz created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateQuizResponse" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
} as const;
