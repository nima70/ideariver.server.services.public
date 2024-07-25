import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import request from "supertest";
import {
  Authorization,
  getKeycloakToken,
  getPublicKey,
  refreshToken,
} from "./Auth"; // Adjust the path as necessary

describe("Authorization Middleware and Token Operations", () => {
  let app: express.Application;
  let token: string;
  let refreshTokenValue: string;

  beforeAll(async () => {
    process.env.KEYCLOAK_CLIENT_ID = "my-client";
    process.env.KEYCLOAK_CLIENT_SECRET = "my-client-secret";
    process.env.KEYCLOAK_REALM = "MyRealm";
    process.env.KEYCLOAK_SERVER = "http://localhost:8080";
    // Retrieve token and refresh token from Keycloak
    const tokenResponse = await getKeycloakToken("test-user", "password");
    token = tokenResponse;

    // Set up express app and middleware
    app = express();
    app.use(express.json());

    app.get("/protected", Authorization, (req: Request, res: Response) => {
      res.json({
        message: "Protected route accessed",
        user: (req as any).user,
      });
    });

    app.get("/refresh-token", async (req: Request, res: Response) => {
      try {
        const newToken = await refreshToken(token);
        res.json({ newToken });
      } catch (error) {
        res.status(500).json({ error: "Failed to refresh token" });
      }
    });
  }, 50000); // Increase timeout to allow for network requests

  it("should return 401 if Authorization header is missing", async () => {
    const response = await request(app).get("/protected");
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Authorization header is missing");
  });

  it("should return 401 if token is missing", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer");
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Token is missing");
  });

  it("should return 403 if token is invalid", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid-token");
    expect(response.status).toBe(403);
  });

  it("should return 200 if token is valid", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Protected route accessed");
    expect(response.body.user).toBeDefined();
  });

  it("should refresh the token successfully", async () => {
    const response = await request(app).get("/refresh-token");
    expect(response.status).toBe(200);
    expect(response.body.newToken).toBeDefined();
  });
});
