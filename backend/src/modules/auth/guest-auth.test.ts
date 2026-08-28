import { describe, expect, it, vi } from "vitest";

vi.mock("@/config/env.js", () => ({
  env: {
    BETTER_AUTH_SECRET: "test-secret-value-with-enough-length!!",
  },
}));

import {
  createGuestUserId,
  signGuestToken,
  verifyGuestToken,
} from "./guest-token.js";

describe("guest auth tokens", () => {
  it("round-trips guest claims", async () => {
    const input = {
      sub: createGuestUserId(),
      name: "Alex Guest",
      email: "alex@example.com",
      sessionId: "507f1f77bcf86cd799439011",
    };

    const token = await signGuestToken(input);
    const verified = await verifyGuestToken(token);

    expect(verified).toMatchObject(input);
    expect(verified?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("rejects tampered tokens", async () => {
    const token = await signGuestToken({
      sub: createGuestUserId(),
      name: "Alex Guest",
      email: "alex@example.com",
      sessionId: "507f1f77bcf86cd799439011",
    });

    const verified = await verifyGuestToken(`${token}x`);
    expect(verified).toBeNull();
  });
});
