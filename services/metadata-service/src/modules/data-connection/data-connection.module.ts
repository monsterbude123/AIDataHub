import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { DataConnectionController } from './data-connection.controller';
import { DataConnectionService } from './data-connection.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DataConnectionController],
  providers: [DataConnectionService],
  exports: [DataConnectionService],
})
export class DataConnectionModule {}
