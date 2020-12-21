import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator((data: string, context: ExecutionContext) => {
  const request: any = context;
  const user = request.user;
  return user && user['id'] ? user['id'] : null;
});
