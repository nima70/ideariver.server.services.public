import { AppTemplateBase, ILogger } from "ideariver.core";
import { Container } from "inversify";
import { ConsoleLogger } from "./ConsoleLogger";
import "module-alias/register";
import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fs from "fs";
import https from "https";
import cors from "cors";
import { ensureEnvVarExists, getEnvVar } from "./EnvironmentVariableHelpers";
import csurf from "csurf";
import { IOpenID } from "./interfaces/IOpenID";
import { OpenID } from "./Auth";
import { TYPES } from "./TYPES";
export abstract class ExpressAppTemplate extends AppTemplateBase<Container> {
  protected port: string;
  protected app: Express;
  protected httpsServer: https.Server | undefined;
  protected openID: IOpenID;

  constructor(
    app: Express | undefined = undefined,
    openID: IOpenID | undefined = undefined
  ) {
    super();
    this.port = "";
    this.app = app === undefined ? express() : app;
    this.openID = openID === undefined ? new OpenID() : openID;
  }
  getApp() {
    return this.app;
  }
  getOpenID() {
    return this.openID;
  }
  createIoc(): Container {
    return new Container();
  }

  createLogger(): ILogger {
    return new ConsoleLogger();
  }

  abstract initContainer(): Promise<void>;

  async init(): Promise<void> {
    dotenv.config();
    await this.openID.init();

    this.port = ensureEnvVarExists("PORT");
    // Security enhancements
    this.app.use(helmet()); // Helmet helps you secure your Express apps by setting various HTTP headers
    this.app.use(express.json()); // Parse incoming JSON requests
    if (ensureEnvVarExists("CORS_EN") === "true") this.app.use(cors());
    // Rate Limiting to prevent brute-force attacks
    const limiter = rateLimit({
      windowMs: parseInt(ensureEnvVarExists("RATE_LIMIT_WINDOW_MS")), // 15 minutes
      max: parseInt(ensureEnvVarExists("RATE_LIMIT_MAX")), // Limit each IP to 100 requests per windowMs
      standardHeaders: true, // Return rate limit info in the RateLimit-* headers
      legacyHeaders: false, // Disable the X-RateLimit-* headers
    });
    this.app.use(limiter);
    if (ensureEnvVarExists("CSURF_EN") === "true") {
      const csrfProtection = csurf({ cookie: true });
      this.app.use((req, res, next) => {
        const skipCsrf =
          req.headers["x-custom-client"] === "non-browser-client";
        if (skipCsrf) {
          return next();
        }
        csrfProtection(req, res, next);
      });
    }
    // Error handling middleware
    this.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        this.logger.error("Error handling middleware: An error occurred:", err);
        res
          .status(500)
          .send(
            "Internal Server Error. Please contact support if the issue persists.!"
          );
      }
    );
    // Start server based on SSL setting
    if (ensureEnvVarExists("SSL_EN") === "true") {
      this.logger.info("SSL is enabled");
      const tlsKeyPath = ensureEnvVarExists("TLS_KEY_PATH");
      const tlsCertPath = ensureEnvVarExists("TLS_CERT_PATH");

      try {
        const httpsOptions = {
          key: fs.readFileSync(tlsKeyPath),
          cert: fs.readFileSync(tlsCertPath),
        };

        this.httpsServer = https.createServer(httpsOptions, this.app);

        // HTTPS enforcement middleware (use only if HTTPS is configured)
        this.app.use((req, res, next) => {
          if (req.headers["x-forwarded-proto"] !== "https") {
            return res.redirect(`https://${req.headers.host}${req.url}`);
          }
          next();
        });
      } catch (error) {
        this.logger.error("Error reading TLS certificate files:", error);
        process.exit(1); // Exit the process if there is an error with the certificates
      }
    }

    this.serverInit(this.app);
  }

  async main(): Promise<void> {
    if (ensureEnvVarExists("SSL_EN") === "true") {
      try {
        this.httpsServer!.listen(443, () => {
          this.logger.info("HTTPS Server running on port 443");
        });
      } catch (error) {
        this.logger.error("Error reading TLS certificate files:", error);
        process.exit(1); // Exit the process if there is an error with the certificates
      }
    } else {
      this.logger.info("SSL is disabled");
      this.app.listen(this.port, () => {
        this.logger.info(`Server is running at http://localhost:${this.port}`);
      });
    }
  }

  async register(ioc: Container): Promise<void> {
    ioc.bind<IOpenID>(TYPES.OpenID).toConstantValue(this.openID);
    ioc.bind<ILogger>(TYPES.Logger).toConstantValue(this.logger);
    ioc.bind<Container>(Container).toSelf();
  }
  abstract resolve(ioc: Container): Promise<void>;
  abstract serverInit(app: Express): Promise<void>;
  abstract exit(): Promise<void>;

  async execute(): Promise<void> {
    await super.execute();
  }
}
