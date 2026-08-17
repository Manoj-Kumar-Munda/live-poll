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
  "/api/quizzes/{id}": {
    get: {
      tags: ["Quizzes"],
      summary: "Get quiz by id",
      description:
        "Host only, owner-scoped. Includes questions in add order (`order` is the array index).",
      security: [{ sessionCookie: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          description: "Quiz MongoDB ObjectId",
        },
      ],
      responses: {
        "200": {
          description: "Quiz fetched",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GetQuizResponse" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    put: {
      tags: ["Quizzes"],
      summary: "Update a draft quiz",
      description:
        "Host only. DRAFT only. Partial body; at least one field required. Does not change status.",
      security: [{ sessionCookie: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          description: "Quiz MongoDB ObjectId",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateQuizRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Quiz updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateQuizResponse" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      tags: ["Quizzes"],
      summary: "Delete a quiz",
      description:
        "Host only, owner-scoped. Deletes the quiz and its embedded questions.",
      security: [{ sessionCookie: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          description: "Quiz MongoDB ObjectId",
        },
      ],
      responses: {
        "200": {
          description: "Quiz deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DeleteQuizResponse" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/api/quizzes/{id}/questions": {
    post: {
      tags: ["Quizzes"],
      summary: "Add a question to a draft quiz",
      description: "Host only. DRAFT only. Questions are appended; order follows add sequence.",
      security: [{ sessionCookie: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          description: "Quiz MongoDB ObjectId",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddQuestionRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "Question added",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddQuestionResponse" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/api/quizzes/{id}/questions/{questionId}": {
    patch: {
      tags: ["Quizzes"],
      summary: "Update a question on a draft quiz",
      description:
        "Host only. DRAFT only. Replaces the question in place (same id and order).",
      security: [{ sessionCookie: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          description: "Quiz MongoDB ObjectId",
        },
        {
          name: "questionId",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          description: "Question subdocument ObjectId",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddQuestionRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Question updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateQuestionResponse" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      tags: ["Quizzes"],
      summary: "Delete a question from a draft quiz",
      description: "Host only. DRAFT only.",
      security: [{ sessionCookie: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          description: "Quiz MongoDB ObjectId",
        },
        {
          name: "questionId",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          description: "Question subdocument ObjectId",
        },
      ],
      responses: {
        "200": {
          description: "Question deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DeleteQuestionResponse" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/api/quizzes/{id}/publish": {
    post: {
      tags: ["Quizzes"],
      summary: "Publish a draft quiz",
      description:
        "Host only. Requires at least one question. Locks the quiz from further edits.",
      security: [{ sessionCookie: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          description: "Quiz MongoDB ObjectId",
        },
      ],
      responses: {
        "200": {
          description: "Quiz published",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PublishQuizResponse" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/api/quizzes/{id}/archive": {
    post: {
      tags: ["Quizzes"],
      summary: "Archive a published quiz",
      description: "Host only. PUBLISHED → ARCHIVED.",
      security: [{ sessionCookie: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
          description: "Quiz MongoDB ObjectId",
        },
      ],
      responses: {
        "200": {
          description: "Quiz archived",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ArchiveQuizResponse" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
  },
} as const;
