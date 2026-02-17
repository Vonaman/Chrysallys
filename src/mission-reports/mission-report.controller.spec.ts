import { Test, TestingModule } from '@nestjs/testing';
import { MissionReportController } from './mission-report.controller';

describe('MissionReportController', () => {
  let controller: MissionReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MissionReportController],
    }).compile();

    controller = module.get<MissionReportController>(MissionReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
