import { Repository, ObjectLiteral } from "typeorm";
import { Request, Response, Router, NextFunction } from "express";
// import { IController } from "./IController"; // Adjust the path as necessary
import { ICrudController, ICrudOperations } from "./ICrudOperations";
import {
  IPaginationQuery,
  IPaginatedResponse,
  IErrorResponse,
} from "@ideariver/core"; // Adjust the path as necessary

export abstract class AbstractCrudController<T extends ObjectLiteral>
  implements ICrudController<T>
{
  router: Router = Router();

  constructor(
    protected repository: Repository<T>,
    private preMiddleware: ICrudOperations<T>[] = []
  ) {
    this.initializeRoutes();
  }

  private getMiddlewareArray(
    methodName: keyof ICrudOperations<T>,
    middlewareArray: ICrudOperations<T>[]
  ): Array<(req: Request, res: Response, next: NextFunction) => void> {
    return (
      middlewareArray
        .map((middlewareObject) => middlewareObject[methodName])
        // .filter((middleware):  middleware !== undefined)
        .map((middleware) => middleware!.bind(this))
    );
  }

  private bindRoute(
    method: "get" | "post" | "put" | "delete",
    path: string,
    middlewareName: keyof ICrudOperations<T>,
    handler: (req: any, res: any) => Promise<void>
  ) {
    this.router[method](
      path,
      ...this.getMiddlewareArray(middlewareName, this.preMiddleware),
      handler
    );
  }
  public getRoutes(): Router {
    return this.router;
  }
  protected initializeRoutes(): void {
    this.bindRoute("get", "/", "getAll", this.getAll.bind(this));
    this.bindRoute(
      "get",
      "/paginate",
      "getPaginated",
      this.getPaginated.bind(this)
    );
    this.bindRoute("get", "/search", "search", this.search.bind(this));
    this.bindRoute("get", "/count", "count", this.count.bind(this));
    this.bindRoute("get", "/:id", "getById", this.getById.bind(this));
    this.bindRoute("post", "/", "create", this.create.bind(this));
    this.bindRoute(
      "post",
      "/bulk-create",
      "bulkCreate",
      this.bulkCreate.bind(this)
    );
    this.bindRoute("put", "/:id", "update", this.update.bind(this));
    this.bindRoute(
      "put",
      "/bulk-update",
      "bulkUpdate",
      this.bulkUpdate.bind(this)
    );
    this.bindRoute("put", "/restore/:id", "restore", this.restore.bind(this));
    this.bindRoute("delete", "/:id", "delete", this.delete.bind(this));
    this.bindRoute(
      "delete",
      "/soft-delete/:id",
      "softDelete",
      this.softDelete.bind(this)
    );
  }
  // protected initializeRoutes(): void {
  //   this.router.get("/", this.getAll.bind(this));
  //   this.router.get("/paginate", this.getPaginated.bind(this)); // Route for pagination
  //   this.router.get("/search", this.search.bind(this)); // Route for search
  //   this.router.get("/count", this.count.bind(this)); // Route for count
  //   // this.router.get("/advanced-search", this.advancedSearch.bind(this));
  //   this.router.get("/:id", this.getById.bind(this));
  //   this.router.post("/", this.create.bind(this));
  //   this.router.post("/bulk-create", this.bulkCreate.bind(this)); // Route for bulk create
  //   this.router.put("/:id", this.update.bind(this));
  //   // this.router.put("/bulk-update", this.bulkUpdate.bind(this)); // Route for bulk update
  //   this.router.put("/restore/:id", this.restore.bind(this)); // Route for restore
  //   this.router.delete("/:id", this.delete.bind(this));
  //   this.router.delete("/soft-delete/:id", this.softDelete.bind(this)); // Route for soft delete
  // }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const entities = await this.repository.find();
      res.json(entities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getPaginated(
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

  async getById(req: Request<{ id: string }>, res: Response): Promise<void> {
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

  async create(req: Request, res: Response): Promise<void> {
    try {
      const entity = this.repository.create(req.body);
      const result = await this.repository.save(entity);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async bulkCreate(req: Request, res: Response): Promise<void> {
    try {
      const entities = this.repository.create(req.body);
      const result = await this.repository.save(entities);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
  async update(req: Request<{ id: string }>, res: Response): Promise<void> {
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
  async bulkUpdate(req: Request, res: Response): Promise<void> {
    try {
      console.log("bulkUpdate called");
      const updates = req.body;
      const result = await this.repository.save(updates);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response): Promise<void> {
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

  async softDelete(req: Request<{ id: string }>, res: Response): Promise<void> {
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

  async restore(req: Request<{ id: string }>, res: Response): Promise<void> {
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

  async search(req: Request, res: Response): Promise<void> {
    try {
      const criteria = req.query;
      const entities = await this.repository.find({ where: criteria as any });
      res.json(entities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async count(req: Request, res: Response): Promise<void> {
    try {
      const count = await this.repository.count();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async advancedSearch(req: Request, res: Response): Promise<void> {
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
