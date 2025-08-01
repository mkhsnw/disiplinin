import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, string>
  implements OnModuleInit
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'error',
        },
      ],
    });
  }
  onModuleInit() {
    this.$on('query', (e: Prisma.QueryEvent) => {
      this.logger.debug(
        `Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`,
      );
    });

    this.$on('info', (e: Prisma.LogEvent) => {
      this.logger.info(`Info: ${e.message}`);
    });

    this.$on('warn', (e: Prisma.LogEvent) => {
      this.logger.warn(`Warning: ${e.message}`);
    });

    this.$on('error', (e: Prisma.LogEvent) => {
      this.logger.error(`Error: ${e.message}`);
    });
  }
}
