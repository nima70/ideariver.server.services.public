import { Request, Response, NextFunction } from "express";
import { TokenSet } from "openid-client";

export interface IOpenID {
  init(): Promise<void>;
  authorize(req: Request, res: Response, next: NextFunction): Promise<any>;
  getKeycloakToken(
    username: string,
    password: string,
    scopes?: string[]
  ): Promise<TokenSet>;
  refreshToken(refreshToken: TokenSet | string): Promise<TokenSet>;
}
