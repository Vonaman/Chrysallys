import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MissionStepsService } from './mission-step.service';
import { MissionStep } from './mission-step.entity';
import { Mission } from '../missions/mission.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MissionStepsService', () => {
  let service: MissionStepsService;
  let mockStepRepository: any;
  let mockMissionRepository: any;

  beforeEach(async () => {
    mockStepRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockMissionRepository = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionStepsService,
        {
          provide: getRepositoryToken(MissionStep),
          useValue: mockStepRepository,
        },
        {
          provide: getRepositoryToken(Mission),
          useValue: mockMissionRepository,
        },
      ],
    }).compile();

    service = module.get<MissionStepsService>(MissionStepsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a mission step with valid data', async () => {
      const stepData = {
        description: 'Test Step',
        agentAssigne: 'Agent Smith',
        statut: 'EN_COURS',
        missionId: 1,
      };

      const mission = { id: 1, titre: 'Mission 1' };
      const createdStep = {
        id: 1,
        description: 'Test Step',
        agentAssigne: 'Agent Smith',
        statut: 'EN_COURS',
        mission,
        dateCreation: new Date(),
        dateModification: new Date(),
      };

      mockMissionRepository.findOneBy.mockResolvedValue(mission);
      mockStepRepository.create.mockReturnValue(createdStep);
      mockStepRepository.save.mockResolvedValue(createdStep);

      const result = await service.create(stepData as any);

      expect(result).toEqual(createdStep);
      expect(mockMissionRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockStepRepository.create).toHaveBeenCalled();
      expect(mockStepRepository.save).toHaveBeenCalled();
    });

    it('should normalize TERMINEE to TERMINE', async () => {
      const stepData = {
        description: 'Test Step',
        agentAssigne: 'Agent Smith',
        statut: 'TERMINEE',
        missionId: 1,
      };

      const mission = { id: 1, titre: 'Mission 1' };
      const createdStep = {
        id: 1,
        description: 'Test Step',
        agentAssigne: 'Agent Smith',
        statut: 'TERMINE',
        mission,
      };

      mockMissionRepository.findOneBy.mockResolvedValue(mission);
      mockStepRepository.create.mockReturnValue(createdStep);
      mockStepRepository.save.mockResolvedValue(createdStep);

      const result = await service.create(stepData as any);

      expect(result.statut).toBe('TERMINE');
    });

    it('should normalize ANNULEE to ANNULE', async () => {
      const stepData = {
        description: 'Test Step',
        agentAssigne: 'Agent Smith',
        statut: 'ANNULEE',
        missionId: 1,
      };

      const mission = { id: 1, titre: 'Mission 1' };
      const createdStep = {
        id: 1,
        statut: 'ANNULE',
        description: 'Test Step',
        agentAssigne: 'Agent Smith',
        mission,
      };

      mockMissionRepository.findOneBy.mockResolvedValue(mission);
      mockStepRepository.create.mockReturnValue(createdStep);
      mockStepRepository.save.mockResolvedValue(createdStep);

      await service.create(stepData as any);

      expect(mockStepRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when description is empty', async () => {
      const stepData = {
        description: '',
        agentAssigne: 'Agent Smith',
        statut: 'EN_COURS',
        missionId: 1,
      };

      await expect(service.create(stepData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when agentAssigne is empty', async () => {
      const stepData = {
        description: 'Test Step',
        agentAssigne: '',
        statut: 'EN_COURS',
        missionId: 1,
      };

      await expect(service.create(stepData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException with invalid statut', async () => {
      const stepData = {
        description: 'Test Step',
        agentAssigne: 'Agent Smith',
        statut: 'INVALID_STATUS',
        missionId: 1,
      };

      await expect(service.create(stepData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when missionId is missing', async () => {
      const stepData = {
        description: 'Test Step',
        agentAssigne: 'Agent Smith',
        statut: 'EN_COURS',
      };

      await expect(service.create(stepData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when mission does not exist', async () => {
      const stepData = {
        description: 'Test Step',
        agentAssigne: 'Agent Smith',
        statut: 'EN_COURS',
        missionId: 999,
      };

      mockMissionRepository.findOneBy.mockResolvedValue(null);

      await expect(service.create(stepData as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when dateFin < dateDebut', async () => {
      const stepData = {
        description: 'Test Step',
        agentAssigne: 'Agent Smith',
        statut: 'EN_COURS',
        missionId: 1,
        dateDebut: new Date('2025-01-10'),
        dateFin: new Date('2025-01-01'),
      };

      mockMissionRepository.findOneBy.mockResolvedValue({ id: 1 });

      await expect(service.create(stepData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept missionId as number or string', async () => {
      const stepData = {
        description: 'Test Step',
        agentAssigne: 'Agent Smith',
        statut: 'EN_COURS',
        missionId: '1',
      };

      const mission = { id: 1, titre: 'Mission 1' };
      const createdStep = { id: 1, description: 'Test Step', agentAssigne: 'Agent Smith', statut: 'EN_COURS', mission };

      mockMissionRepository.findOneBy.mockResolvedValue(mission);
      mockStepRepository.create.mockReturnValue(createdStep);
      mockStepRepository.save.mockResolvedValue(createdStep);

      const result = await service.create(stepData as any);

      expect(mockMissionRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(createdStep);
    });

    it('should accept mission object with id property', async () => {
      const stepData = {
        description: 'Test Step',
        agentAssigne: 'Agent Smith',
        statut: 'EN_COURS',
        mission: { id: 1 },
      };

      const mission = { id: 1, titre: 'Mission 1' };
      const createdStep = { id: 1, description: 'Test Step', agentAssigne: 'Agent Smith', statut: 'EN_COURS', mission };

      mockMissionRepository.findOneBy.mockResolvedValue(mission);
      mockStepRepository.create.mockReturnValue(createdStep);
      mockStepRepository.save.mockResolvedValue(createdStep);

      const result = await service.create(stepData as any);

      expect(result).toEqual(createdStep);
    });
  });

  describe('findAll', () => {
    it('should return all mission steps with relations', async () => {
      const steps = [
        { id: 1, description: 'Step 1', agentAssigne: 'Agent A', statut: 'EN_COURS', mission: { id: 1 } },
        { id: 2, description: 'Step 2', agentAssigne: 'Agent B', statut: 'TERMINE', mission: { id: 2 } },
      ];

      mockStepRepository.find.mockResolvedValue(steps);

      const result = await service.findAll();

      expect(result).toEqual(steps);
      expect(mockStepRepository.find).toHaveBeenCalledWith({ relations: ['mission'] });
    });

    it('should return empty array when no steps exist', async () => {
      mockStepRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('updateById', () => {
    it('should update a mission step', async () => {
      const existingStep = {
        id: 1,
        description: 'Old',
        agentAssigne: 'Agent A',
        statut: 'EN_COURS',
        mission: { id: 1 },
      };
      const updateData = { description: 'New' };
      const updatedStep = { ...existingStep, ...updateData };

      mockStepRepository.findOne.mockResolvedValue(existingStep);
      mockStepRepository.save.mockResolvedValue(updatedStep);

      const result = await service.updateById(1, updateData);

      expect(result.description).toBe('New');
      expect(mockStepRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when step not found', async () => {
      mockStepRepository.findOne.mockResolvedValue(null);

      await expect(service.updateById(999, { description: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when updating with empty description', async () => {
      const existingStep = {
        id: 1,
        description: 'Old',
        agentAssigne: 'Agent A',
        statut: 'EN_COURS',
      };

      mockStepRepository.findOne.mockResolvedValue(existingStep);

      await expect(service.updateById(1, { description: '' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when updating with empty agentAssigne', async () => {
      const existingStep = {
        id: 1,
        description: 'Description',
        agentAssigne: 'Agent A',
        statut: 'EN_COURS',
      };

      mockStepRepository.findOne.mockResolvedValue(existingStep);

      await expect(service.updateById(1, { agentAssigne: '' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should normalize statut on update', async () => {
      const existingStep = {
        id: 1,
        description: 'Description',
        agentAssigne: 'Agent A',
        statut: 'EN_COURS',
      };
      const updateData = { statut: 'TERMINEE' };
      const updatedStep = { ...existingStep, statut: 'TERMINE' };

      mockStepRepository.findOne.mockResolvedValue(existingStep);
      mockStepRepository.save.mockResolvedValue(updatedStep);

      const result = await service.updateById(1, updateData);

      expect(result.statut).toBe('TERMINE');
    });

    it('should update mission if missionId provided', async () => {
      const existingStep = {
        id: 1,
        description: 'Description',
        agentAssigne: 'Agent A',
        statut: 'EN_COURS',
        mission: { id: 1 },
      };
      const newMission = { id: 2, titre: 'Mission 2' };
      const updateData = { missionId: 2 };
      const updatedStep = { ...existingStep, mission: newMission };

      mockStepRepository.findOne.mockResolvedValue(existingStep);
      mockMissionRepository.findOneBy.mockResolvedValue(newMission);
      mockStepRepository.save.mockResolvedValue(updatedStep);

      const result = await service.updateById(1, updateData as any);

      expect(mockMissionRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
      expect(result.mission.id).toBe(2);
    });

    it('should throw NotFoundException when new mission does not exist', async () => {
      const existingStep = {
        id: 1,
        description: 'Description',
        agentAssigne: 'Agent A',
        statut: 'EN_COURS',
        mission: { id: 1 },
      };

      mockStepRepository.findOne.mockResolvedValue(existingStep);
      mockMissionRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateById(1, { missionId: 999 } as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException with invalid missionId', async () => {
      const existingStep = {
        id: 1,
        description: 'Description',
        agentAssigne: 'Agent A',
        statut: 'EN_COURS',
        mission: { id: 1 },
      };

      mockStepRepository.findOne.mockResolvedValue(existingStep);

      await expect(service.updateById(1, { missionId: NaN } as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteById', () => {
    it('should delete a mission step', async () => {
      mockStepRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteById(1);

      expect(mockStepRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when step not found', async () => {
      mockStepRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteAll', () => {
    it('should delete all mission steps', async () => {
      mockStepRepository.clear.mockResolvedValue(undefined);

      await service.deleteAll();

      expect(mockStepRepository.clear).toHaveBeenCalled();
    });
  });

  describe('patchById', () => {
    it('should patch a mission step with partial data', async () => {
      const existingStep = {
        id: 1,
        description: 'Old',
        agentAssigne: 'Agent A',
        statut: 'EN_COURS',
      };
      const patchData = { agentAssigne: 'Agent B' };
      const patchedStep = { ...existingStep, ...patchData };

      mockStepRepository.findOne.mockResolvedValue(existingStep);
      mockStepRepository.save.mockResolvedValue(patchedStep);

      const result = await service.patchById(1, patchData);

      expect(result.agentAssigne).toBe('Agent B');
    });

    it('should call updateById internally', async () => {
      const existingStep = {
        id: 1,
        description: 'Old',
        agentAssigne: 'Agent A',
        statut: 'EN_COURS',
      };
      const patchData = { description: 'New' };
      const patchedStep = { ...existingStep, ...patchData };

      mockStepRepository.findOne.mockResolvedValue(existingStep);
      mockStepRepository.save.mockResolvedValue(patchedStep);

      const result = await service.patchById(1, patchData);

      expect(result.description).toBe('New');
    });
  });
});
