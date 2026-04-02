import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from '../../common/database/database.module';
import { AuthService } from './auth.service';
import { CaslAbilityFactory } from './casl-ability.factory';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [DatabaseModule],
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
