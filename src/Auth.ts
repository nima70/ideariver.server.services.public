import { Request, Response, NextFunction } from "express";
import { Issuer, Client, TokenSet } from "openid-client";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class OpenID {
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
    const keycloakIssuer = await Issuer.discover(
      `${this.serverUrl}/auth/realms/${this.realm}/.well-known/openid-configuration`
    );
    this.client = new keycloakIssuer.Client({
      client_id: this.clientId!,
      client_secret: this.clientSecret!,
    });
  }

  public async authorize(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
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

// import { Request, Response, NextFunction } from "express";
// import jsonwebtoken from "jsonwebtoken";
// import axios from "axios";
// import qs from "qs";

// // Extend the Request type to include user property
// interface AuthenticatedRequest extends Request {
//   user?: any;
// }
// //get meta data
// //`${keycloakServer}/auth/realms/${realm}/.well-known/openid-configuration`;
// // get the public key
// //http://localhost:8080/auth/realms/MyRealm/protocol/openid-connect/certs
// // Function to get the JWT secret from Keycloak
// export async function getPublicKey() {
//   const realm = process.env.KEYCLOAK_REALM!;
//   const keycloakServer = process.env.KEYCLOAK_SERVER!;
//   const wellKnownUrl = `${keycloakServer}/auth/realms/${realm}/.well-known/openid-configuration`;

//   try {
//     const response = await axios.get(wellKnownUrl);
//     const jwksUri = response.data.jwks_uri;

//     // Fetch JWKS and find the correct key
//     const jwksResponse = await axios.get(jwksUri);
//     const jwks = jwksResponse.data;

//     // Extract the first key for simplicity, assuming it's the correct one
//     if (jwks.keys && jwks.keys.length) {
//       const key = jwks.keys[0];
//       const cert = key.x5c[0];
//       const pem = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----`;
//       return pem;
//     } else {
//       throw new Error("No JWKS keys found");
//     }
//   } catch (error) {
//     console.error("Error fetching public key from Keycloak:", error);
//     throw new Error("Failed to fetch public key from Keycloak");
//   }
// }

// // Middleware for Authorization
// export const Authorization = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (!req.headers.authorization) {
//     return res.status(401).json({ error: "Authorization header is missing" });
//   }

//   const token = req.headers.authorization.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ error: "Token is missing" });
//   }

//   try {
//     const publicKey = await getPublicKey();
//     jsonwebtoken.verify(
//       token,
//       publicKey,
//       { algorithms: ["RS256"] },
//       (err, decoded) => {
//         if (err) {
//           console.error("JWT verification error:", err);
//           return res.sendStatus(403);
//         }
//         req.user = decoded;
//         next();
//       }
//     );
//   } catch (error) {
//     return res.status(500).json({
//       error: "Failed to verify token",
//     });
//   }
// };

// export const getTokenUrl = (
//   keycloakServer: string | undefined,
//   realm: string | undefined
// ): string | undefined => {
//   return `${keycloakServer}/auth/realms/${realm}/protocol/openid-connect/token`;
// };
// //"token_endpoint": "http://localhost:8080/auth/realms/MyRealm/protocol/openid-connect/token",
// export const getKeycloakToken = async (username: string, password: string) => {
//   const clientId = process.env.KEYCLOAK_CLIENT_ID;
//   const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
//   const realm = process.env.KEYCLOAK_REALM;
//   const keycloakServer = process.env.KEYCLOAK_SERVER;
//   const url = getTokenUrl(keycloakServer, realm);
//   const data = qs.stringify({
//     client_id: clientId,
//     client_secret: clientSecret,
//     grant_type: "password",
//     username: username,
//     password: password,
//   });

//   const config = {
//     method: "post",
//     url: url,
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     data: data,
//   };

//   try {
//     const response = await axios.request(config);
//     return response.data.access_token;
//   } catch (error) {
//     console.error("Error fetching token from Keycloak:", error);
//     throw new Error("Failed to fetch token from Keycloak");
//   }
// };

// // Function to Refresh Token
// export const refreshToken = async (
//   refreshToken: string
// ): Promise<string | null> => {
//   const clientId = process.env.KEYCLOAK_CLIENT_ID;
//   const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
//   const realm = process.env.KEYCLOAK_REALM;
//   const keycloakServer = process.env.KEYCLOAK_SERVER;
//   const url = getTokenUrl(keycloakServer, realm);

//   const data = qs.stringify({
//     client_id: clientId,
//     client_secret: clientSecret,
//     grant_type: "refresh_token",
//     refresh_token: refreshToken,
//   });

//   const config = {
//     method: "post",
//     maxBodyLength: Infinity,
//     url: url,
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     data: data,
//   };

//   try {
//     const response = await axios.request(config);
//     return response.data.access_token; // Return the new access token
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// };
