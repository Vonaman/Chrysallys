import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MissionReportsService } from './mission-report.service';
import { MissionReport } from './mission-report.entity';
import { MissionStep } from '../mission-step/mission-step.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MissionReportsService', () => {
  let service: MissionReportsService;
  let mockReportRepository: any;
  let mockStepRepository: any;

  beforeEach(async () => {
    mockReportRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      create: jest.fn(),
      findOneBy: jest.fn(),
    };

    mockStepRepository = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionReportsService,
        {
          provide: getRepositoryToken(MissionReport),
          useValue: mockReportRepository,
        },
        {
          provide: getRepositoryToken(MissionStep),
          useValue: mockStepRepository,
        },
      ],
    }).compile();

    service = module.get<MissionReportsService>(MissionReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockStep = { id: 1, description: 'Test step' };

    it('should create a report with valid data', async () => {
      const reportData = {
        details: 'Test report',
        agentRedacteur: 'Agent John',
        missionStepId: 1,
      };
      const createdReport = {
        id: 1,
        ...reportData,
        missionStep: mockStep,
      };

      mockStepRepository.findOneBy.mockResolvedValue(mockStep);
      mockReportRepository.create.mockReturnValue(createdReport);
      mockReportRepository.save.mockResolvedValue(createdReport);

      const result = await service.create(reportData);

      expect(result).toEqual(createdReport);
      expect(mockReportRepository.save).toHaveBeenCalled();
    });

    it('should accept missionStep as object with id', async () => {
      const reportData = {
        details: 'Test report',
        agentRedacteur: 'Agent John',
        missionStep: { id: 1 },
      } as any;
      const createdReport = {
        id: 1,
        details: 'Test report',
        agentRedacteur: 'Agent John',
        missionStep: mockStep,
      };

      mockStepRepository.findOneBy.mockResolvedValue(mockStep);
      mockReportRepository.create.mockReturnValue(createdReport);
      mockReportRepository.save.mockResolvedValue(createdReport);

      const result = await service.create(reportData);

      expect(result).toEqual(createdReport);
    });

    it('should accept missionStepId as string', async () => {
      const reportData = {
        details: 'Test report',
        agentRedacteur: 'Agent John',
        missionStepId: 1,
      };
      const createdReport = {
        id: 1,
        details: 'Test report',
        agentRedacteur: 'Agent John',
        missionStep: mockStep,
      };

      mockStepRepository.findOneBy.mockResolvedValue(mockStep);
      mockReportRepository.create.mockReturnValue(createdReport);
      mockReportRepository.save.mockResolvedValue(createdReport);

      await service.create(reportData);

      expect(mockStepRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw BadRequestException when details is empty', async () => {
      const reportData = {
        details: '',
        agentRedacteur: 'Agent John',
        missionStepId: 1,
      };

      await expect(service.create(reportData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when details is missing', async () => {
      const reportData = {
        agentRedacteur: 'Agent John',
        missionStepId: 1,
      };

      await expect(service.create(reportData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when agentRedacteur is empty', async () => {
      const reportData = {
        details: 'Test report',
        agentRedacteur: '',
        missionStepId: 1,
      };

      await expect(service.create(reportData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when agentRedacteur is missing', async () => {
      const reportData = {
        details: 'Test report',
        missionStepId: 1,
      };

      await expect(service.create(reportData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when missionStepId is missing', async () => {
      const reportData = {
        details: 'Test report',
        agentRedacteur: 'Agent John',
      };

      await expect(service.create(reportData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when missionStepId is NaN', async () => {
      const reportData = {
        details: 'Test report',
        agentRedacteur: 'Agent John',
        missionStepId: NaN,
      };

      await expect(service.create(reportData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when MissionStep not found', async () => {
      const reportData = {
        details: 'Test report',
        agentRedacteur: 'Agent John',
        missionStepId: 999,
      };

      mockStepRepository.findOneBy.mockResolvedValue(null);

      await expect(service.create(reportData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when missionStep id is string that cannot be parsed', async () => {
      const reportData = {
        details: 'Test report',
        agentRedacteur: 'Agent John',
        missionStep: { id: 'invalid' },
      } as any;

      await expect(service.create(reportData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should encrypt details field via transformer', async () => {
      const reportData = {
        details: 'Confidential details',
        agentRedacteur: 'Agent John',
        missionStepId: 1,
      };
      const createdReport = {
        id: 1,
        details: 'Confidential details',
        agentRedacteur: 'Agent John',
        missionStep: mockStep,
      };

      mockStepRepository.findOneBy.mockResolvedValue(mockStep);
      mockReportRepository.create.mockReturnValue(createdReport);
      mockReportRepository.save.mockResolvedValue(createdReport);

      const result = await service.create(reportData);

      expect(result.details).toBe('Confidential details');
    });

    it('should accept missionStep.id as string', async () => {
      const reportData = {
        details: 'Test report',
        agentRedacteur: 'Agent John',
        missionStep: { id: '1' },
      } as any;
      const createdReport = {
        id: 1,
        details: 'Test report',
        agentRedacteur: 'Agent John',
        missionStep: mockStep,
      };

      mockStepRepository.findOneBy.mockResolvedValue(mockStep);
      mockReportRepository.create.mockReturnValue(createdReport);
      mockReportRepository.save.mockResolvedValue(createdReport);

      const result = await service.create(reportData);

      expect(mockStepRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(createdReport);
    });
  });

  describe('findAll', () => {
    it('should return all reports with relations', async () => {
      const mockReports = [
        {
          id: 1,
          details: 'Report 1',
          agentRedacteur: 'Agent A',
          missionStep: { id: 1 },
        },
        {
          id: 2,
          details: 'Report 2',
          agentRedacteur: 'Agent B',
          missionStep: { id: 2 },
        },
      ];

      mockReportRepository.find.mockResolvedValue(mockReports);

      const result = await service.findAll();

      expect(result).toEqual(mockReports);
      expect(mockReportRepository.find).toHaveBeenCalledWith({
        relations: ['missionStep'],
      });
    });

    it('should return empty array when no reports exist', async () => {
      mockReportRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('deleteById', () => {
    it('should delete a report', async () => {
      mockReportRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteById(1);

      expect(mockReportRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when report not found', async () => {
      mockReportRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteAll', () => {
    it('should delete all reports', async () => {
      mockReportRepository.clear.mockResolvedValue(undefined);

      await service.deleteAll();

      expect(mockReportRepository.clear).toHaveBeenCalled();
    });
  });

  describe('updateById', () => {
    const mockStep = { id: 1, description: 'Test step' };
    const existingReport = {
      id: 1,
      details: 'Old details',
      agentRedacteur: 'Old Agent',
      missionStep: mockStep,
    };

    it('should update a report', async () => {
      const updateData = { agentRedacteur: 'New Agent' };
      const updatedReport = {
        ...existingReport,
        agentRedacteur: 'New Agent',
      };

      mockReportRepository.findOne.mockResolvedValue(existingReport);
      mockReportRepository.save.mockResolvedValue(updatedReport);

      const result = await service.updateById(1, updateData);

      expect(result.agentRedacteur).toBe('New Agent');
      expect(mockReportRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when report not found', async () => {
      mockReportRepository.findOne.mockResolvedValue(null);

      await expect(service.updateById(999, { agentRedacteur: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when updating with empty details', async () => {
      mockReportRepository.findOne.mockResolvedValue(existingReport);

      await expect(service.updateById(1, { details: '' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when updating with empty agentRedacteur', async () => {
      mockReportRepository.findOne.mockResolvedValue(existingReport);

      await expect(
        service.updateById(1, { agentRedacteur: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate and update missionStep if provided', async () => {
      const newStep = { id: 2, description: 'New step' };
      const updateData = { missionStepId: 2 };
      const updatedReport = {
        ...existingReport,
        missionStep: newStep,
      };

      mockReportRepository.findOne.mockResolvedValue(existingReport);
      mockStepRepository.findOneBy.mockResolvedValue(newStep);
      mockReportRepository.save.mockResolvedValue(updatedReport);

      const result = await service.updateById(1, updateData);

      expect(mockStepRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
      expect(result.missionStep).toEqual(newStep);
    });

    it('should throw NotFoundException when new MissionStep not found', async () => {
      const updateData = { missionStepId: 999 };

      mockReportRepository.findOne.mockResolvedValue(existingReport);
      mockStepRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateById(1, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when missionStepId is invalid', async () => {
      const updateData = { missionStepId: NaN };

      mockReportRepository.findOne.mockResolvedValue(existingReport);

      await expect(service.updateById(1, updateData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow updating only details', async () => {
      const updateData = { details: 'New details' };
      const updatedReport = {
        ...existingReport,
        details: 'New details',
      };

      mockReportRepository.findOne.mockResolvedValue(existingReport);
      mockReportRepository.save.mockResolvedValue(updatedReport);

      const result = await service.updateById(1, updateData);

      expect(result.details).toBe('New details');
    });

    it('should accept missionStepId as string in update', async () => {
      const newStep = { id: 2, description: 'New step' };
      const updateData = { missionStepId: 2 };
      const updatedReport = {
        ...existingReport,
        missionStep: newStep,
      };

      mockReportRepository.findOne.mockResolvedValue(existingReport);
      mockStepRepository.findOneBy.mockResolvedValue(newStep);
      mockReportRepository.save.mockResolvedValue(updatedReport);

      await service.updateById(1, updateData);

      expect(mockStepRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
    });
  });

  describe('patchById', () => {
    const mockStep = { id: 1, description: 'Test step' };
    const existingReport = {
      id: 1,
      details: 'Old details',
      agentRedacteur: 'Old Agent',
      missionStep: mockStep,
    };

    it('should patch a report with partial data', async () => {
      const patchData = { agentRedacteur: 'Patched Agent' };
      const patchedReport = {
        ...existingReport,
        agentRedacteur: 'Patched Agent',
      };

      mockReportRepository.findOne.mockResolvedValue(existingReport);
      mockReportRepository.save.mockResolvedValue(patchedReport);

      const result = await service.patchById(1, patchData);

      expect(result.agentRedacteur).toBe('Patched Agent');
    });

    it('should call updateById internally', async () => {
      const patchData = { details: 'Patched details' };
      const patchedReport = {
        ...existingReport,
        details: 'Patched details',
      };

      mockReportRepository.findOne.mockResolvedValue(existingReport);
      mockReportRepository.save.mockResolvedValue(patchedReport);

      const result = await service.patchById(1, patchData);

      expect(mockReportRepository.findOne).toHaveBeenCalled();
      expect(result.details).toBe('Patched details');
    });
  });
});
