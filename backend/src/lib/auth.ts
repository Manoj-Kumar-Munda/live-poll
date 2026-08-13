import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError } from "better-auth/api";
import { getAuthDb, getMongoClient } from "@/config/db.js";
import { env } from "@/config/env.js";
import { emailService } from "@/modules/auth/email.service.js";
import { isUserRole } from "@/modules/auth/types.js";

export const auth = betterAuth({
  appName: "LivePoll",
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.CLIENT_URL],

  database: mongodbAdapter(getAuthDb(), {
    client: getMongoClient(),
    transaction: false,
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "participant",
        input: true,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await emailService.sendResetPassword({ user, url });
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = user.role as string | undefined;

          if (role && !isUserRole(role)) {
            throw new APIError("BAD_REQUEST", {
              message: "Role must be 'host' or 'participant'",
            });
          }

          return {
            data: {
              ...user,
              role: role ?? "participant",
            },
          };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
