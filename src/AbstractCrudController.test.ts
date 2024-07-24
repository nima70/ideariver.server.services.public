import "reflect-metadata";
import { createConnection, getRepository, Repository } from "typeorm";
import { AbstractCrudController } from "./AbstractCrudController"; // Adjust the path as necessary
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import express, { Request, Response } from "express";
import request from "supertest";

// Define a test entity
@Entity()
class TestEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;
}

// Define a concrete controller for testing
class TestEntityController extends AbstractCrudController<TestEntity> {
  constructor(repository: Repository<TestEntity>) {
    super(repository);
  }
}
describe('AbstractCrudController', () => {
    let app: express.Application;
    let repository: Repository<TestEntity>;
    let controller: TestEntityController;
  
    beforeAll(async () => {
      // Create a connection to the in-memory SQLite database
      await createConnection({
        type: 'sqlite',
        database: ':memory:',
        dropSchema: true,
        entities: [TestEntity],
        synchronize: true,
        logging: false,
      });
  
      repository = getRepository(TestEntity);
      controller = new TestEntityController(repository);
      app = express();
      app.use(express.json());
      app.use('/test-entities', controller.getRoutes());
    });
  
    afterAll(async () => {
      const conn = await getRepository(TestEntity).manager.connection;
      await conn.close();
    });
  
    it('should create an entity', async () => {
      const response = await request(app)
        .post('/test-entities')
        .send({ name: 'Test Entity' });
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Entity');
    });
  
    it('should get all entities', async () => {
      const response = await request(app).get('/test-entities');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });
  
    it('should get an entity by ID', async () => {
      const entity = await repository.save({ name: 'Another Test Entity' });
      const response = await request(app).get(`/test-entities/${entity.id}`);
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Another Test Entity');
    });
  
    it('should update an entity', async () => {
      const entity = await repository.save({ name: 'Update Test Entity' });
      const response = await request(app)
        .put(`/test-entities/${entity.id}`)
        .send({ name: 'Updated Name' });
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });
  
    it('should delete an entity', async () => {
      const entity = await repository.save({ name: 'Delete Test Entity' });
      const response = await request(app).delete(`/test-entities/${entity.id}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Entity deleted');
    });
  
    it('should paginate entities', async () => {
      await repository.clear(); // Clear the repository before running the pagination test
  
      await repository.save({ name: 'Entity 1' });
      await repository.save({ name: 'Entity 2' });
      await repository.save({ name: 'Entity 3' });
  
      const response = await request(app).get('/test-entities/paginate').query({ page: 1, limit: 2 });
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.total).toBe(3); // Including the newly created entities
      expect(response.body.page).toBe(1);
      expect(response.body.last_page).toBe(2);
    });
  });
