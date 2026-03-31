import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH || ':memory:',
      entities: ['dist/**/*.entity.js'],
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
