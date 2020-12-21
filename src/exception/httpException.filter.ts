import { QueryFailedError } from "typeorm";
import { BaseExceptionFilter } from "@nestjs/core";
import { ArgumentsHost, HttpStatus, Catch } from "@nestjs/common";
import { Response } from "express";

@Catch(QueryFailedError)
export class HttpExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'UNKNOWN_DATABASE_ERROR' });
  }
}
