import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  createPool,
  FieldPacket,
  Pool,
  RowDataPacket,
} from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;
  private readonly maxRetries = Number(process.env.DB_CONNECT_RETRY_MAX ?? 6);
  private readonly retryDelayMs = Number(process.env.DB_CONNECT_RETRY_DELAY ?? 1000);

  async onModuleInit() {
    this.pool = createPool({
      host: process.env.MYSQL_HOST ?? 'localhost',
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER ?? 'root',
      password: process.env.MYSQL_PASSWORD ?? '',
      database: process.env.MYSQL_DB ?? 'nestjs_db',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });

    await this.ensureConnection();
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database pool is not initialized yet');
    }
    return this.pool;
  }

  async query<T extends RowDataPacket = RowDataPacket>(
    sql: string,
    params?: any[],
  ): Promise<[T[], FieldPacket[]]> {
    return this.getPool().query<T[]>(sql, params);
  }

  private async ensureConnection() {
    for (let attempt = 1; attempt <= this.maxRetries; attempt += 1) {
      try {
        const connection = await this.pool.getConnection();
        await connection.ping();
        connection.release();
        this.logger.log('Successfully connected to MySQL');
        return;
      } catch (error) {
        this.logger.warn(
          `MySQL connection attempt ${attempt} failed.`,
          error as Error,
        );
        if (attempt === this.maxRetries) {
          this.logger.error(
            'Unable to reach MySQL during startup after retries.',
            error as Error,
          );
          return;
        }
        await this.delay(this.retryDelayMs);
      }
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

