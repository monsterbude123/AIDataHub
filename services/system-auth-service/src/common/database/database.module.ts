import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH || ':memory:',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: false,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {
  constructor(private dataSource: DataSource) {
    // Access the dataSource to satisfy TypeScript's noUnusedParameters check
    // Injected here to ensure DataSource is initialized by DI container
    void this.dataSource;
  }
}
