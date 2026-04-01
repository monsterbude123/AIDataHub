import { Module } from '@nestjs/common';

import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { InMemoryTaskRepository } from './repositories/task.repository';
import { InMemoryTaskExecutionRepository } from './repositories/task-execution.repository';

@Module({
  controllers: [SchedulerController],
  providers: [
    SchedulerService,
    InMemoryTaskRepository,
    InMemoryTaskExecutionRepository,
  ],
})
export class SchedulerModule {}
