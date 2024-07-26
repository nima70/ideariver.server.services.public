import { Request, Response, NextFunction } from "express";
import { Issuer, Client, TokenSet } from "openid-client";
import dotenv from "dotenv";
import { IOpenID } from "./interfaces/IOpenID";
dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class OpenID implements IOpenID {
  private serverUrl: string;
  private realm: string;
  private clientId: string;
  private clientSecret: string;
  private client: Client | undefined = undefined;

  public constructor() {
    this.serverUrl = process.env.KEYCLOAK_SERVER!;
    this.realm = process.env.KEYCLOAK_REALM!;
    this.clientId = process.env.KEYCLOAK_CLIENT_ID!;
    this.clientSecret = process.env.KEYCLOAK_CLIENT_SECRET!;
  }

  public async init() {
    try {
      const keycloakIssuer = await Issuer.discover(
        `${this.serverUrl}/auth/realms/${this.realm}/.well-known/openid-configuration`
      );
      this.client = new keycloakIssuer.Client({
        client_id: this.clientId!,
        client_secret: this.clientSecret!,
      });
    } catch (error) {
      console.error("Error initializing Keycloak client:", error);
      throw new Error("Failed to initialize Keycloak client");
    }
  }

  public async authorize(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "Authorization header is missing" });
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token is missing" });
    }

    try {
      const userInfo = await this.client!.userinfo(token);
      req.user = userInfo;
      next();
    } catch (err) {
      console.error("JWT verification error:", err);
      return res.sendStatus(403);
    }
  }

  public async getKeycloakToken(
    username: string,
    password: string
  ): Promise<TokenSet> {
    try {
      const tokenSet = await this.client!.grant({
        grant_type: "password",
        username: username,
        password: password,
      });
      return tokenSet;
    } catch (error) {
      console.error("Error fetching token from Keycloak:", error);
      throw new Error("Failed to fetch token from Keycloak");
    }
  }

  public async refreshToken(
    refreshToken: TokenSet | string
  ): Promise<TokenSet> {
    try {
      const tokenSet = await this.client!.refresh(refreshToken);
      return tokenSet;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw new Error("Failed to fetch token from Keycloak");
    }
  }
}
