import { Test, TestingModule } from '@nestjs/testing';
import { MissionStepController } from './mission-step.controller';
import { MissionStepsService } from './mission-step.service';

describe('MissionStepController', () => {
  let controller: MissionStepController;

  beforeEach(async () => {
    const mockMissionStepsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MissionStepController],
      providers: [
        {
          provide: MissionStepsService,
          useValue: mockMissionStepsService,
        },
      ],
    }).compile();

    controller = module.get<MissionStepController>(MissionStepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
