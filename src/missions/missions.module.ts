import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './mission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mission])],
  exports: [TypeOrmModule],
})
export class MissionsModule {}
