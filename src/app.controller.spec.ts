import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MissionsService } from './missions/missions.service';
import { MissionStepsService } from './mission-step/mission-step.service';
import { MissionReportsService } from './mission-reports/mission-report.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockMissionsService = {
      findAll: jest.fn().mockResolvedValue([]),
    };
    const mockMissionStepsService = {
      findAll: jest.fn().mockResolvedValue([]),
    };
    const mockMissionReportsService = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: MissionsService,
          useValue: mockMissionsService,
        },
        {
          provide: MissionStepsService,
          useValue: mockMissionStepsService,
        },
        {
          provide: MissionReportsService,
          useValue: mockMissionReportsService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });
});
