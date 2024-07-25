import { Request, Response, NextFunction } from "express";
import { validate, ValidationError, IsString } from "class-validator";
import { plainToInstance } from "class-transformer";
import { AbstractValidator } from "./AbstractValidator"; // Adjust the path as necessary
import express from "express";
import request from "supertest";

// Define a test entity
class TestEntity {
  @IsString()
  name!: string;
}

// Define a concrete validator for testing
class TestEntityValidator extends AbstractValidator<TestEntity> {
  constructor() {
    super(TestEntity);
  }

  async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    next();
  }
}

// Test setup
describe("AbstractValidator", () => {
  let app: express.Application;

  beforeAll(() => {
    const validator = new TestEntityValidator();
    app = express();
    app.use(express.json());

    // Sample routes using the validator
    app.post("/create", validator.create.bind(validator), (req: Request, res: Response) => {
      res.status(201).json({ message: "Created" });
    });

    app.post("/bulk-create", validator.bulkCreate.bind(validator), (req: Request, res: Response) => {
      res.status(201).json({ message: "Bulk Created" });
    });

    app.put("/update/:id", validator.update.bind(validator), (req: Request, res: Response) => {
      res.status(200).json({ message: "Updated" });
    });

    app.put("/bulk-update", validator.bulkUpdate.bind(validator), (req: Request, res: Response) => {
      res.status(200).json({ message: "Bulk Updated" });
    });
  });

  it("should validate create request", async () => {
    const response = await request(app).post("/create").send({ name: "Valid Name" });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Created");
  });

  it("should return 400 for invalid create request", async () => {
    const response = await request(app).post("/create").send({ name: 123 });
    expect(response.status).toBe(400);
    expect(response.body).toHaveLength(1);
  });

  it("should validate bulk create request", async () => {
    const response = await request(app).post("/bulk-create").send([{ name: "Valid Name 1" }, { name: "Valid Name 2" }]);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Bulk Created");
  });

  it("should return 400 for invalid bulk create request", async () => {
    const response = await request(app).post("/bulk-create").send([{ name: 123 }, { name: "Valid Name" }]);
    expect(response.status).toBe(400);
    expect(response.body).toHaveLength(1);
  });

  it("should validate update request", async () => {
    const response = await request(app).put("/update/1").send({ name: "Updated Name" });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Updated");
  });

  it("should return 400 for invalid update request", async () => {
    const response = await request(app).put("/update/1").send({ name: 123 });
    expect(response.status).toBe(400);
    expect(response.body).toHaveLength(1);
  });

  it("should validate bulk update request", async () => {
    const response = await request(app).put("/bulk-update").send([{ name: "Updated Name 1" }, { name: "Updated Name 2" }]);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Bulk Updated");
  });

  it("should return 400 for invalid bulk update request", async () => {
    const response = await request(app).put("/bulk-update").send([{ name: 123 }, { name: "Updated Name" }]);
    expect(response.status).toBe(400);
    expect(response.body).toHaveLength(1);
  });
});
