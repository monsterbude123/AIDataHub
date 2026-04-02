import { Module } from '@nestjs/common';
import { TaskSchedulerController } from './task-scheduler.controller';
import { TaskSchedulerService } from './task-scheduler.service';
import { InMemoryDagRepository } from './repositories/dag.repository';
import { InMemoryQueueRepository } from './repositories/queue.repository';
import { InMemoryExecutionRepository } from './repositories/execution.repository';

@Module({
  controllers: [TaskSchedulerController],
  providers: [
    TaskSchedulerService,
    InMemoryDagRepository,
    InMemoryQueueRepository,
    InMemoryExecutionRepository,
  ],
})
export class TaskSchedulerModule {}
