import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from '../../common/database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CaslAbilityFactory } from './casl-ability.factory';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AuthService,
    CaslAbilityFactory,
  ],
  exports: [AuthService, CaslAbilityFactory],
})
export class AuthModule {}
