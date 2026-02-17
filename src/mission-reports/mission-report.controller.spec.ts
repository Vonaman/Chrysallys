import { Test, TestingModule } from '@nestjs/testing';
import { MissionReportController } from './mission-report.controller';
import { MissionReportsService } from './mission-report.service';

describe('MissionReportController', () => {
  let controller: MissionReportController;

  beforeEach(async () => {
    const mockMissionReportsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MissionReportController],
      providers: [
        {
          provide: MissionReportsService,
          useValue: mockMissionReportsService,
        },
      ],
    }).compile();

    controller = module.get<MissionReportController>(MissionReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
