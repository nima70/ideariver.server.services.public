import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  Company,
  Filings,
  Recent,
  File,
  Address,
  FormerName,
} from "./entities";
import * as dotenv from "dotenv";

dotenv.config();

const isTest = process.env.NODE_ENV === "test";
const enitites = [Company, Address, FormerName, Filings, Recent, File];
export const AppDataSource = new DataSource(
  isTest
    ? {
        type: "sqlite",
        database: ":memory:",
        synchronize: true,
        logging: false,
        entities: enitites,
      }
    : {
        type: "postgres",
        host: process.env.POSTGRES_HOST || "localhost",
        port: 5432,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        synchronize: true,
        logging: false,
        entities: enitites,
      }
);
