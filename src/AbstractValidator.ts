import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";
import { ICrudValidator } from "./ICrudOperations"; // Adjust the path as necessary

export abstract class AbstractValidator<T extends object>
  implements ICrudValidator<T>
{
  private typeConstructor: new () => T;

  constructor(typeConstructor: new () => T) {
    this.typeConstructor = typeConstructor;
  }

  private async validateSingleRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const input = plainToInstance(this.typeConstructor, req.body);
    const errors: ValidationError[] = await validate(input);
    if (errors.length > 0) {
      res.status(400).json(errors);
    } else {
      next();
    }
  }

  private async validateBulkRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const inputs = req.body.map((item: object) =>
      plainToInstance(this.typeConstructor, item)
    );
    const errors = await Promise.all(
      inputs.map((input: any) => validate(input))
    );
    const validationErrors = errors.flat();

    if (validationErrors.length > 0) {
      res.status(400).json(validationErrors);
    } else {
      next();
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    next();
  }

  async getPaginated(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    next();
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    next();
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.validateSingleRequest(req, res, next);
  }

  async bulkCreate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    await this.validateBulkRequest(req, res, next);
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.validateSingleRequest(req, res, next);
  }

  async bulkUpdate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    await this.validateBulkRequest(req, res, next);
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    next();
  }

  async softDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    next();
  }

  async restore(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    next();
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    next();
  }

  async count(req: Request, res: Response, next: NextFunction): Promise<void> {
    next();
  }

  async advancedSearch(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    next();
  }
}
