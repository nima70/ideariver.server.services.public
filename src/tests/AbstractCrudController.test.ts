import "reflect-metadata";
import { createConnection, getRepository, Repository } from "typeorm";
import { AbstractCrudController } from "../AbstractCrudController"; // Adjust the path as necessary
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import express from "express";
import request from "supertest";

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

// Define a concrete controller for testing
class TestEntityController extends AbstractCrudController<TestEntity> {
  constructor(repository: Repository<TestEntity>) {
    super(repository);
  }
}

describe("AbstractCrudController", () => {
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
    controller = new TestEntityController(repository);
    app = express();
    app.use(express.json());
    app.use("/test-entities", controller.getRoutes());
  });

  afterAll(async () => {
    const conn = await getRepository(TestEntity).manager.connection;
    await conn.close();
  });

  it("should create an entity", async () => {
    const response = await request(app)
      .post("/test-entities")
      .send({ name: "Test Entity" });
    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Test Entity");
  });

  it("should get all entities", async () => {
    const response = await request(app).get("/test-entities");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it("should get an entity by ID", async () => {
    const entity = await repository.save({ name: "Another Test Entity" });
    const response = await request(app).get(`/test-entities/${entity.id}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Another Test Entity");
  });

  it("should update an entity", async () => {
    const entity = await repository.save({ name: "Update Test Entity" });
    const response = await request(app)
      .put(`/test-entities/${entity.id}`)
      .send({ name: "Updated Name" });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated Name");
  });

  it("should delete an entity", async () => {
    const entity = await repository.save({ name: "Delete Test Entity" });
    const response = await request(app).delete(`/test-entities/${entity.id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Entity deleted");
  });

  it("should paginate entities", async () => {
    await repository.clear(); // Clear the repository before running the pagination test

    await repository.save({ name: "Entity 1" });
    await repository.save({ name: "Entity 2" });
    await repository.save({ name: "Entity 3" });

    const response = await request(app)
      .get("/test-entities/paginate")
      .query({ page: 1, limit: 2 });
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(2);
    expect(response.body.total).toBe(3); // Including the newly created entities
    expect(response.body.page).toBe(1);
    expect(response.body.last_page).toBe(2);
  });

  // Additional tests for new methods

  it("should bulk create entities", async () => {
    await repository.clear();
    const response = await request(app)
      .post("/test-entities/bulk-create")
      .send([{ name: "Entity 1" }, { name: "Entity 2" }]);
    expect(response.status).toBe(201);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toBe("Entity 1");
    expect(response.body[1].name).toBe("Entity 2");
  });

  // it("should bulk update entities", async () => {
  //   const entity1 = await repository.save({ name: "Entity 1" });
  //   const entity2 = await repository.save({ name: "Entity 2" });
  //   const entities = [entity1, entity2];
  //   entities[0].name = "Updated Entity 1";
  //   entities[1].name = "Updated Entity 2";
  //   const response = await request(app)
  //     .put("/test-entities/bulk-update")
  //     .send(entities);
  //   expect(response.status).toBe(200);
  //   expect(response.body.length).toBe(2);
  //   expect(response.body[0].name).toBe("Updated Entity 1");
  //   expect(response.body[1].name).toBe("Updated Entity 2");
  // }, 100000);

  it("should soft delete an entity", async () => {
    const entity = await repository.save({ name: "Soft Delete Test Entity" });
    const response = await request(app).delete(
      `/test-entities/soft-delete/${entity.id}`
    );
    expect(response.status).toBe(200);
    expect(response.body.isDeleted).toBe(true);
  });

  it("should restore a soft-deleted entity", async () => {
    const entity = await repository.save({
      name: "Restore Test Entity",
      isDeleted: true,
    });
    const response = await request(app).put(
      `/test-entities/restore/${entity.id}`
    );
    expect(response.status).toBe(200);
    expect(response.body.isDeleted).toBe(false);
  });

  it("should count entities", async () => {
    await repository.clear();
    await repository.save({ name: "Count Test Entity" });
    const response = await request(app).get("/test-entities/count");
    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
  });

  it("should search entities", async () => {
    await repository.clear();
    await repository.save({ name: "Search Test Entity" });
    const response = await request(app)
      .get("/test-entities/search")
      .query({ name: "Search Test Entity" });
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe("Search Test Entity");
  }, 10000);

  // it("should perform advanced search with filters and sorting", async () => {
  //   await repository.clear();
  //   await repository.save({ name: "Advanced Search Entity 1" });
  //   await repository.save({ name: "Advanced Search Entity 2" });
  //   //{ name: "Advanced Search Entity 2" },
  //   const response = await request(app)
  //     .get("/test-entities/advanced-search")
  //     .query({
  //       filters: JSON.stringify({ name: "Advanced Search Entity 1" }),
  //       sort: JSON.stringify({ name: "ASC" }),
  //       page: 1,
  //       limit: 1,
  //     });
  //   expect(response.status).toBe(200);
  //   expect(response.body.data.length).toBe(1);
  //   expect(response.body.total).toBe(1);
  //   expect(response.body.page).toBe(1);
  //   expect(response.body.last_page).toBe(1);
  // });
});
