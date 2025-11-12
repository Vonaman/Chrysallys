import { Test, TestingModule } from '@nestjs/testing';
import { MissionStepController } from './mission-step.controller';

describe('MissionStepController', () => {
  let controller: MissionStepController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MissionStepController],
    }).compile();

    controller = module.get<MissionStepController>(MissionStepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
