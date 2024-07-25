import { Request, Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";
import axios from "axios";
import qs from "qs";

// Extend the Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
}
//get meta data
//`${keycloakServer}/auth/realms/${realm}/.well-known/openid-configuration`;
// get the public key
//http://localhost:8080/auth/realms/MyRealm/protocol/openid-connect/certs
// Function to get the JWT secret from Keycloak
export async function getJWTSecret() {
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  const realm = process.env.KEYCLOAK_REALM;
  const keycloakServer = process.env.KEYCLOAK_SERVER;
  const tokenUrl = `${keycloakServer}/auth/realms/${realm}/protocol/openid-connect/certs`;

  const data = qs.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const config = {
    method: "get",
    url: tokenUrl,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    const { access_token } = response.data;

    // Decode the token to get the public key
    const decodedToken = jsonwebtoken.decode(access_token, { complete: true });
    if (decodedToken && typeof decodedToken === "object") {
      process.env.JSON_WEB_TOKEN_SECRET = decodedToken.header.kid;
    } else {
      throw new Error("Unable to decode token");
    }
  } catch (error) {
    console.error("Error fetching JWT secret from Keycloak:", error);
    throw new Error("Failed to fetch JWT secret from Keycloak");
  }
}

// Middleware for Authorization
export const Authorization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const secret = process.env.JSON_WEB_TOKEN_SECRET;

  if (!secret) {
    try {
      await getJWTSecret();
    } catch (error) {
      return res.status(500).json({
        error: "JWT secret is not defined and failed to fetch from Keycloak",
      });
    }
  }

  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  jsonwebtoken.verify(
    token,
    process.env.JSON_WEB_TOKEN_SECRET!,
    { algorithms: ["HS256"] },
    (err: any, decoded: any) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      }
      req.user = decoded;
      next();
    }
  );
};

export const getKeycloakToken = async (username: string, password: string) => {
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  const realm = process.env.KEYCLOAK_REALM;
  const keycloakServer = process.env.KEYCLOAK_SERVER;
  const tokenUrl = `${keycloakServer}/auth/realms/${realm}/protocol/openid-connect/token`;

  const data = qs.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "password",
    username: username,
    password: password,
  });

  const config = {
    method: "post",
    url: tokenUrl,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching token from Keycloak:", error);
    throw new Error("Failed to fetch token from Keycloak");
  }
};

// Function to Refresh Token
export const refreshToken = async (): Promise<string | null> => {
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  const refreshToken = process.env.KEYCLOAK_REFRESH_TOKEN;
  const url = process.env.KEYCLOAK_TOKEN_URL;

  const data = qs.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    return response.data.access_token; // Return the new access token
  } catch (error) {
    console.error(error);
    return null;
  }
};

// // Middleware for Token Refresh
// export const TokenRefreshMiddleware = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   const newToken = await refreshToken();
//   if (newToken) {
//     req.headers.authorization = `Bearer ${newToken}`;
//     next();
//   } else {
//     res.status(500).json({ error: "Unable to refresh token" });
//   }
// };
