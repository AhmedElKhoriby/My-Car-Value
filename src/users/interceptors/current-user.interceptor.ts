/*
NOTES: Why do we need separate Interceptor & Decorator?

1. Parameter Decorators don't support async/await operations
2. Cannot inject dependencies into decorators
3. Interceptor runs before decorator and prepares data
4. Single Responsibility Principle:
  - Interceptor: Fetches user from DB
  - Decorator: Extracts ready data

Flow: Request → Interceptor (fetch user) → Controller → Decorator (extract user)
*/

import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    const { userId } = request.session ?? {};

    if (userId) {
      request.currentUser = await this.usersService.findOne(userId);
    }

    return next.handle();
  }
}
