import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

export function validateDTO(dtoClass: any) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const dtoInstance = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors
        .map((error) => {
          const constraints = error.constraints;
          return constraints ? Object.values(constraints) : [];
        })
        .flat();

      _res.status(400).json({
        status: "error",
        message: "Erro de validação",
        errors: messages,
      });
      return;
    }

    req.body = dtoInstance;
    next();
  };
}
