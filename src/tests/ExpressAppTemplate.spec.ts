import { Container } from "inversify";
import { ExpressAppTemplate } from "../ExpressAppTemplate";
import request from "supertest";
import { ConsoleLogger } from "../ConsoleLogger";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";
import { ensureEnvVarExists } from "../EnvironmentVariableHelpers";
import { OpenID } from "../Auth";
import { TokenSet } from "openid-client";
process.env.PORT = "3000";
process.env.APP_ENV = "dev";
process.env.SSL_EN = "false";
process.env.TLS_KEY_PATH = "E:/projects/hope_v2/server.key";
process.env.TLS_CERT_PATH = "E:/projects/hope_v2/server.crt";
process.env.CORS_EN = "false";
process.env.CSURF_EN = "false";
process.env.RATE_LIMIT_WINDOW_MS = "900000"; // 15 minutes in milliseconds
process.env.RATE_LIMIT_MAX = "100"; // 100 requests per window
process.env.KEYCLOAK_CLIENT_ID = "my-client";
process.env.KEYCLOAK_CLIENT_SECRET = "my-client-secret";
process.env.KEYCLOAK_REALM = "MyRealm";
process.env.KEYCLOAK_SERVER = "http://localhost:8080";

class TestApp extends ExpressAppTemplate {
  public token: TokenSet | undefined = undefined;
  async serverInit(app: Express): Promise<void> {
    app.get("/test", (req: Request, res: Response) => {
      res.status(200).send("Test route accessed");
    });
    app.get(
      "/protected",
      this.openID.authorize.bind(this.openID),
      (req: Request, res: Response) => {
        res.status(200).send({
          message: "Protected route accessed",
          user: (req as any).user,
        });
      }
    );
    app.get("/error", (req: Request, res: Response) => {
      throw new Error();
    });
  }
  async initContainer(): Promise<void> {
    // Custom container initialization logic
  }
  async init(): Promise<void> {
    await super.init();
    this.token = await this.openID.getKeycloakToken("test-user", "password");
  }

  async register(ioc: Container): Promise<void> {
    await super.register(ioc);
    // Custom registration logic
  }

  async resolve(ioc: Container): Promise<void> {
    // Custom resolve logic
  }

  async exit(): Promise<void> {
    // Custom exit logic
  }
}

describe("ExpressAppTemplate", () => {
  let appObj: TestApp;
  let app: Express;
  //   let keycloakService: OpenID;
  beforeAll(async () => {
    appObj = new TestApp();
    await appObj.init();
    app = appObj.getApp();
    // keycloakService = new OpenID();
    // await keycloakService.init();
  }, 20000);
  beforeEach(async () => {});

  afterEach(async () => {});

  it("should initialize the app and return 200 for test route", async () => {
    const response = await request(app).get("/test");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Test route accessed");
  });

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

  it("should return 500 for internal server error", async () => {
    const response = await request(app).get("/error");
    expect(response.status).toBe(500);
  });
  it("should return 200 if token is valid", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${appObj.token!.access_token}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Protected route accessed");
    expect(response.body.user).toBeDefined();
  }, 20000);
});
