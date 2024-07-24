import { Repository, ObjectLiteral } from "typeorm";
import { Request, Response, Router } from "express";
import { IController } from "./IController"; // Adjust the path as necessary
import {
  IPaginationQuery,
  IPaginatedResponse,
  IErrorResponse,
} from "@ideariver/core"; // Adjust the path as necessary

export abstract class AbstractCrudController<T extends ObjectLiteral>
  implements IController
{
  protected router: Router = Router();

  constructor(protected repository: Repository<T>) {
    this.initializeRoutes();
  }

  public getRoutes(): Router {
    return this.router;
  }

  protected initializeRoutes(): void {
    this.router.get("/", this.getAll.bind(this));
    this.router.get("/paginate", this.getPaginated.bind(this)); // Route for pagination
    this.router.get("/search", this.search.bind(this)); // Route for search
    this.router.get("/count", this.count.bind(this)); // Route for count
    this.router.post("/", this.create.bind(this));
    this.router.post("/bulk-create", this.bulkCreate.bind(this)); // Route for bulk create
    this.router.put("/:id", this.update.bind(this));
    this.router.put("/bulk-update", this.bulkUpdate.bind(this)); // Route for bulk update
    this.router.put("/restore/:id", this.restore.bind(this)); // Route for restore
    this.router.delete("/:id", this.delete.bind(this));
    this.router.delete("/soft-delete/:id", this.softDelete.bind(this)); // Route for soft delete
  }

  protected async getAll(req: Request, res: Response): Promise<void> {
    try {
      const entities = await this.repository.find();
      res.json(entities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  protected async getPaginated(
    req: Request<{}, {}, {}, IPaginationQuery>,
    res: Response<IPaginatedResponse<T> | IErrorResponse>
  ): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const take = Number(limit);
      const skip = (Number(page) - 1) * take;

      const [result, total] = await this.repository.findAndCount({
        take: take,
        skip: skip,
      });

      res.json({
        data: result,
        total,
        page: Number(page),
        last_page: Math.ceil(total / take),
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  protected async getById(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const entity = await this.repository.findOneBy({
        id: req.params.id as any,
      });
      if (entity) {
        res.json(entity);
      } else {
        res.status(404).json({ message: "Entity not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  protected async create(req: Request, res: Response): Promise<void> {
    try {
      const entity = this.repository.create(req.body);
      const result = await this.repository.save(entity);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  protected async bulkCreate(req: Request, res: Response): Promise<void> {
    try {
      const entities = this.repository.create(req.body);
      const result = await this.repository.save(entities);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
  protected async update(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const entity = await this.repository.findOneBy({
        id: req.params.id as any,
      });
      if (!entity) {
        res.status(404).json({ message: "Entity not found" });
        return;
      }
      this.repository.merge(entity, req.body);
      const result = await this.repository.save(entity);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
  protected async bulkUpdate(req: Request, res: Response): Promise<void> {
    try {
      const updates = req.body;
      const result = await this.repository.save(updates);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  protected async delete(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const result = await this.repository.delete(req.params.id as any);
      if (result.affected) {
        res.json({ message: "Entity deleted" });
      } else {
        res.status(404).json({ message: "Entity not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  protected async softDelete(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const entity = await this.repository.findOneBy({
        id: req.params.id as any,
      });
      if (!entity) {
        res.status(404).json({ message: "Entity not found" });
        return;
      }
      (entity as any).isDeleted = true;
      const result = await this.repository.save(entity);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  protected async restore(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const entity = await this.repository.findOneBy({
        id: req.params.id as any,
      });
      if (!entity) {
        res.status(404).json({ message: "Entity not found" });
        return;
      }
      (entity as any).isDeleted = false;
      const result = await this.repository.save(entity);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  protected async search(req: Request, res: Response): Promise<void> {
    try {
      const criteria = req.query;
      const entities = await this.repository.find({ where: criteria as any });
      res.json(entities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  protected async count(req: Request, res: Response): Promise<void> {
    try {
      const count = await this.repository.count();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  protected async advancedSearch(req: Request, res: Response): Promise<void> {
    try {
      const { filters, sort, page = 1, limit = 10 } = req.query;
      const take = Number(limit);
      const skip = (Number(page) - 1) * take;

      const [result, total] = await this.repository.findAndCount({
        where: filters as any,
        order: sort as any,
        take: take,
        skip: skip,
      });

      res.json({
        data: result,
        total,
        page: Number(page),
        last_page: Math.ceil(total / take),
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
}
