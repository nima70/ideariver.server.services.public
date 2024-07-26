import { Request, Response, NextFunction } from "express";
import { Issuer, Client, TokenSet } from "openid-client";

export interface IOpenID {
  init(): Promise<void>;
  authorize(req: Request, res: Response, next: NextFunction): Promise<any>;
  getKeycloakToken(username: string, password: string): Promise<TokenSet>;
  refreshToken(refreshToken: TokenSet | string): Promise<TokenSet>;
}
