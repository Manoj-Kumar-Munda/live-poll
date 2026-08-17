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
    QuizDetail: {
      allOf: [
        { $ref: "#/components/schemas/Quiz" },
        {
          type: "object",
          required: ["questions"],
          properties: {
            questions: {
              type: "array",
              items: { $ref: "#/components/schemas/Question" },
            },
          },
        },
      ],
    },
    GetQuizResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        message: { type: "string", example: "Quiz fetched" },
        data: {
          type: "object",
          required: ["quiz"],
          properties: {
            quiz: { $ref: "#/components/schemas/QuizDetail" },
          },
        },
      },
    },
    UpdateQuizRequest: {
      type: "object",
      minProperties: 1,
      properties: {
        title: {
          type: "string",
          minLength: 1,
          maxLength: 120,
          example: "Updated title",
        },
        description: {
          type: "string",
          maxLength: 2000,
          example: "Optional",
        },
        pointsPerQuestion: {
          type: "integer",
          minimum: 1,
          maximum: 1000,
          example: 10,
        },
        timeLimitSeconds: {
          type: "integer",
          minimum: 5,
          maximum: 300,
          example: 30,
        },
      },
    },
    UpdateQuizResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        message: { type: "string", example: "Quiz updated" },
        data: {
          type: "object",
          required: ["quiz"],
          properties: {
            quiz: { $ref: "#/components/schemas/Quiz" },
          },
        },
      },
    },
    DeleteQuizResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        message: { type: "string", example: "Quiz deleted" },
        data: { nullable: true, example: null },
      },
    },
    QuestionType: {
      type: "string",
      enum: ["MCQ", "POLL", "OPEN_TEXT"],
    },
    Question: {
      type: "object",
      required: ["id", "type", "prompt", "order"],
      properties: {
        id: { type: "string" },
        type: { $ref: "#/components/schemas/QuestionType" },
        prompt: { type: "string" },
        order: { type: "integer", minimum: 0 },
        options: { type: "array", items: { type: "string" } },
        correctAnswer: { type: "string" },
        maxLength: { type: "integer" },
      },
    },
    AddQuestionRequest: {
      oneOf: [
        {
          type: "object",
          required: ["type", "prompt", "options", "correctAnswer"],
          properties: {
            type: { type: "string", enum: ["MCQ"] },
            prompt: { type: "string" },
            options: {
              type: "array",
              items: { type: "string" },
              minItems: 2,
              maxItems: 4,
            },
            correctAnswer: { type: "string" },
          },
        },
        {
          type: "object",
          required: ["type", "prompt", "options"],
          properties: {
            type: { type: "string", enum: ["POLL"] },
            prompt: { type: "string" },
            options: {
              type: "array",
              items: { type: "string" },
              minItems: 2,
              maxItems: 6,
            },
          },
        },
        {
          type: "object",
          required: ["type", "prompt"],
          properties: {
            type: { type: "string", enum: ["OPEN_TEXT"] },
            prompt: { type: "string" },
            maxLength: { type: "integer", default: 80 },
          },
        },
      ],
    },
    AddQuestionResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 201 },
        message: { type: "string", example: "Question added" },
        data: {
          type: "object",
          required: ["question"],
          properties: {
            question: { $ref: "#/components/schemas/Question" },
          },
        },
      },
    },
    UpdateQuestionResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        message: { type: "string", example: "Question updated" },
        data: {
          type: "object",
          required: ["question"],
          properties: {
            question: { $ref: "#/components/schemas/Question" },
          },
        },
      },
    },
    DeleteQuestionResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        message: { type: "string", example: "Question deleted" },
        data: { nullable: true, example: null },
      },
    },
    PublishQuizResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        message: { type: "string", example: "Quiz published" },
        data: {
          type: "object",
          required: ["quiz"],
          properties: {
            quiz: { $ref: "#/components/schemas/Quiz" },
          },
        },
      },
    },
    ArchiveQuizResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        message: { type: "string", example: "Quiz archived" },
        data: {
          type: "object",
          required: ["quiz"],
          properties: {
            quiz: { $ref: "#/components/schemas/Quiz" },
          },
        },
      },
    },
    LiveSessionStatus: {
      type: "string",
      enum: ["WAITING", "LIVE", "FINISHED"],
    },
    LiveSessionParticipant: {
      type: "object",
      required: [
        "id",
        "userId",
        "displayName",
        "status",
        "score",
        "joinedAt",
      ],
      properties: {
        id: { type: "string" },
        userId: { type: "string" },
        displayName: { type: "string" },
        status: {
          type: "string",
          enum: ["ACTIVE", "QUIT", "FINISHED"],
        },
        score: { type: "integer" },
        joinedAt: { type: "string", format: "date-time" },
      },
    },
    LiveSession: {
      type: "object",
      required: [
        "id",
        "quizId",
        "quizTitle",
        "hostId",
        "roomCode",
        "status",
        "participantCount",
        "currentQuestionIndex",
        "questionEndsAt",
        "expiresAt",
        "liveStartedAt",
        "finishedAt",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        id: { type: "string" },
        quizId: { type: "string" },
        quizTitle: { type: "string" },
        hostId: { type: "string" },
        roomCode: { type: "string", example: "ABCDEF" },
        status: { $ref: "#/components/schemas/LiveSessionStatus" },
        participantCount: { type: "integer" },
        currentQuestionIndex: { type: "integer" },
        questionEndsAt: { type: "string", format: "date-time", nullable: true },
        expiresAt: { type: "string", format: "date-time" },
        liveStartedAt: { type: "string", format: "date-time", nullable: true },
        finishedAt: { type: "string", format: "date-time", nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    LiveSessionDetail: {
      allOf: [
        { $ref: "#/components/schemas/LiveSession" },
        {
          type: "object",
          required: ["role", "participants"],
          properties: {
            role: { type: "string", enum: ["host", "participant"] },
            participants: {
              type: "array",
              items: { $ref: "#/components/schemas/LiveSessionParticipant" },
            },
          },
        },
      ],
    },
    CreateLiveSessionRequest: {
      type: "object",
      required: ["quizId"],
      properties: {
        quizId: { type: "string", pattern: "^[a-fA-F0-9]{24}$" },
      },
    },
    JoinLiveSessionRequest: {
      type: "object",
      required: ["roomCode"],
      properties: {
        roomCode: { type: "string", minLength: 6, maxLength: 6, example: "ABCDEF" },
      },
    },
    LiveSessionResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        message: { type: "string" },
        data: {
          type: "object",
          required: ["session"],
          properties: {
            session: { $ref: "#/components/schemas/LiveSessionDetail" },
          },
        },
      },
    },
    LiveSessionListResponse: {
      type: "object",
      required: ["success", "statusCode", "message", "data"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        message: { type: "string", example: "Sessions fetched" },
        data: {
          type: "object",
          required: ["sessions"],
          properties: {
            sessions: {
              type: "array",
              items: { $ref: "#/components/schemas/LiveSession" },
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
    NotFound: {
      description: "Resource not found or not owned by the current user",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiErrorResponse" },
          example: {
            success: false,
            statusCode: 404,
            message: "Quiz not found",
            data: null,
          },
        },
      },
    },
  },
} as const;
