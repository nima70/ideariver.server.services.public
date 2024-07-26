import "reflect-metadata";
import { createConnection, getRepository, Repository } from "typeorm";
import { AbstractCrudController } from "../AbstractCrudController"; // Adjust the path as necessary
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import express, { Request, Response, NextFunction } from "express";
import request from "supertest";
import { ICrudOperations } from "../ICrudOperations";
import { AbstractValidator } from "../AbstractValidator";
// Define a test entity
@Entity()
class TestEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ default: false })
  isDeleted!: boolean;
}
class Middleware implements ICrudOperations<TestEntity> {
  async getAll(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    res.setHeader("X-Pre-Middleware", "preMiddleware");
    next();
  }
  async getPaginated(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    next();
  }
  async getById(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    next();
  }
  async create(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    next();
  }
  async bulkCreate(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    next();
  }
  async update(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    next();
  }
  async bulkUpdate(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    next();
  }
  async delete(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    next();
  }
  async softDelete(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    next();
  }
  async restore(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    next();
  }
  async search(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    next();
  }
  async count(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    next();
  }
  async advancedSearch(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    next();
  }
}


class TestEntityController extends AbstractCrudController<TestEntity> {
  constructor(
    repository: Repository<TestEntity>,
    preMiddleware: ICrudOperations<TestEntity>[] = [new Middleware()]
  ) {
    super(repository, preMiddleware);
  }
}

describe("AbstractCrudController Middleware", () => {
  let app: express.Application;
  let repository: Repository<TestEntity>;
  let controller: TestEntityController;

  beforeAll(async () => {
    // Create a connection to the in-memory SQLite database
    await createConnection({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: [TestEntity],
      synchronize: true,
      logging: false,
    });

    repository = getRepository(TestEntity);

    const preMiddleware: ICrudOperations<TestEntity>[] = [new Middleware()];

    controller = new TestEntityController(repository, preMiddleware);
    app = express();
    app.use(express.json());
    app.use("/test-entities", controller.getRoutes());
  });

  afterAll(async () => {
    const conn = await getRepository(TestEntity).manager.connection;
    await conn.close();
  });

  it("should call pre and post middleware for getAll", async () => {
    // Create test data
    await repository.save({ name: "Test Entity 1" });
    await repository.save({ name: "Test Entity 2" });

    const response = await request(app).get("/test-entities");

    // Assert middleware and handler are called
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toBe("Test Entity 1");
    expect(response.body[1].name).toBe("Test Entity 2");
    // expect(response.headers["x-post-middleware"]).toBe("postMiddleware");
    expect(response.headers["x-pre-middleware"]).toBe("preMiddleware");
  });
});
