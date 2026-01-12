import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getDatabaseStatus() {
    try {
      await this.databaseService.query('SELECT 1 as ok');
      return { status: 'ok' as const };
    } catch (error) {
      return {
        status: 'error' as const,
        message: (error as Error).message,
      };
    }
  }
}
