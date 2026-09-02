import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@/lib/auth.js";
import { env } from "@/config/env.js";
import userRouter from "@/modules/auth/user.route.js";
import { openApiDocument } from "@/docs/openapi.js";
import {
  swaggerHandler,
  swaggerMiddleware,
} from "@/docs/swagger.js";
import { notFoundHandler } from "@/middlewares/notFoundHandler.js";
import { errorHandler } from "@/middlewares/errorHandler.js";
import quizRouter from "@/modules/quiz/quiz.route.js";
import sessionRouter from "@/modules/session/session.route.js";

const app = express();

console.log(env.CLIENT_URL);

const corsConfig = {
  origin: env.CLIENT_URL.toString(),
  credentials: true,
};
app.use(cors(corsConfig));

app.all("/api/auth/{*splat}", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/docs/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

app.use("/api/docs", swaggerMiddleware, swaggerHandler);

app.use("/api/users", userRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/sessions", sessionRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
