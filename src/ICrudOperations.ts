import { Request, Response, Router, NextFunction } from "express";
import { IController } from "./IController";

export interface ICrudOperations<T> {
  getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPaginated(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById(req: Request, res: Response, next: NextFunction): Promise<void>;
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  bulkCreate(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  bulkUpdate(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
  softDelete(req: Request, res: Response, next: NextFunction): Promise<void>;
  restore(req: Request, res: Response, next: NextFunction): Promise<void>;
  search(req: Request, res: Response, next: NextFunction): Promise<void>;
  count(req: Request, res: Response, next: NextFunction): Promise<void>;
  advancedSearch(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
export interface ICrudController<T> extends ICrudOperations<T>, IController {}

export interface ICrudValidator<T> extends ICrudOperations<T> {}
