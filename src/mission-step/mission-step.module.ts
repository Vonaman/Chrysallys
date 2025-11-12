import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionStep } from './mission-step.entity';
import { MissionStepController } from './mission-step.controller';
import { MissionStepsService } from './mission-step.service';

@Module({
  imports: [TypeOrmModule.forFeature([MissionStep])],
  controllers: [MissionStepController],
  providers: [MissionStepsService],
  exports: [MissionStepsService],
})
export class MissionStepsModule {}
