import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MissionsService } from './missions.service';
import { Mission } from './mission.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MissionsService', () => {
  let service: MissionsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionsService,
        {
          provide: getRepositoryToken(Mission),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MissionsService>(MissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a mission with valid data', async () => {
      const missionData = {
        titre: 'Test Mission',
        statut: 'EN_COURS',
        agentReferent: 'Agent Smith',
      };
      const createdMission = {
        id: 1,
        ...missionData,
        dateCreation: new Date(),
        dateModification: new Date(),
      };

      mockRepository.create.mockReturnValue(createdMission);
      mockRepository.save.mockResolvedValue(createdMission);

      const result = await service.create(missionData as any);

      expect(result).toEqual(createdMission);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should normalize TERMINEE to TERMINE', async () => {
      const missionData = {
        titre: 'Test Mission',
        statut: 'TERMINEE',
        agentReferent: 'Agent Smith',
      };
      const createdMission = {
        id: 1,
        titre: 'Test Mission',
        statut: 'TERMINE',
        agentReferent: 'Agent Smith',
      };

      mockRepository.create.mockReturnValue(createdMission);
      mockRepository.save.mockResolvedValue(createdMission);

      const result = await service.create(missionData as any);

      expect(result.statut).toBe('TERMINE');
    });

    it('should normalize ANNULEE to ANNULE', async () => {
      const missionData = {
        titre: 'Test Mission',
        statut: 'ANNULEE',
        agentReferent: 'Agent Smith',
      };
      const createdMission = {
        id: 1,
        titre: 'Test Mission',
        statut: 'ANNULE',
        agentReferent: 'Agent Smith',
      };

      mockRepository.create.mockReturnValue(createdMission);
      mockRepository.save.mockResolvedValue(createdMission);

      await service.create(missionData as any);

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when titre is empty', async () => {
      const missionData = {
        titre: '',
        statut: 'EN_COURS',
        agentReferent: 'Agent Smith',
      };

      await expect(service.create(missionData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when titre is missing', async () => {
      const missionData = {
        statut: 'EN_COURS',
        agentReferent: 'Agent Smith',
      };

      await expect(service.create(missionData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when agentReferent is empty', async () => {
      const missionData = {
        titre: 'Test Mission',
        statut: 'EN_COURS',
        agentReferent: '',
      };

      await expect(service.create(missionData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when agentReferent is missing', async () => {
      const missionData = {
        titre: 'Test Mission',
        statut: 'EN_COURS',
      };

      await expect(service.create(missionData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException with invalid statut', async () => {
      const missionData = {
        titre: 'Test Mission',
        statut: 'INVALID_STATUS',
        agentReferent: 'Agent Smith',
      };

      await expect(service.create(missionData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when dateFin < dateDebut', async () => {
      const missionData = {
        titre: 'Test Mission',
        statut: 'EN_COURS',
        agentReferent: 'Agent Smith',
        dateDebut: new Date('2025-01-10'),
        dateFin: new Date('2025-01-01'),
      };

      await expect(service.create(missionData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException with invalid dateDebut', async () => {
      const missionData = {
        titre: 'Test Mission',
        statut: 'EN_COURS',
        agentReferent: 'Agent Smith',
        dateDebut: 'invalid-date' as any,
      };

      await expect(service.create(missionData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException with invalid dateFin', async () => {
      const missionData = {
        titre: 'Test Mission',
        statut: 'EN_COURS',
        agentReferent: 'Agent Smith',
        dateFin: 'invalid-date' as any,
      };

      await expect(service.create(missionData as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all missions', async () => {
      const missions = [
        {
          id: 1,
          titre: 'Mission 1',
          statut: 'EN_COURS',
          agentReferent: 'Agent A',
        },
        {
          id: 2,
          titre: 'Mission 2',
          statut: 'TERMINE',
          agentReferent: 'Agent B',
        },
      ];

      mockRepository.find.mockResolvedValue(missions);

      const result = await service.findAll();

      expect(result).toEqual(missions);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return empty array when no missions exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('updateById', () => {
    it('should update a mission', async () => {
      const existingMission = {
        id: 1,
        titre: 'Old Title',
        statut: 'EN_COURS',
        agentReferent: 'Agent A',
      };
      const updateData = { titre: 'New Title' };
      const updatedMission = { ...existingMission, ...updateData };

      mockRepository.findOneBy.mockResolvedValue(existingMission);
      mockRepository.save.mockResolvedValue(updatedMission);

      const result = await service.updateById(1, updateData);

      expect(result.titre).toBe('New Title');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when mission not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateById(999, { titre: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when updating with empty titre', async () => {
      const existingMission = {
        id: 1,
        titre: 'Old Title',
        statut: 'EN_COURS',
        agentReferent: 'Agent A',
      };

      mockRepository.findOneBy.mockResolvedValue(existingMission);

      await expect(service.updateById(1, { titre: '' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when updating with empty agentReferent', async () => {
      const existingMission = {
        id: 1,
        titre: 'Title',
        statut: 'EN_COURS',
        agentReferent: 'Agent A',
      };

      mockRepository.findOneBy.mockResolvedValue(existingMission);

      await expect(
        service.updateById(1, { agentReferent: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should normalize statut on update', async () => {
      const existingMission = {
        id: 1,
        titre: 'Title',
        statut: 'EN_COURS',
        agentReferent: 'Agent A',
      };
      const updateData = { statut: 'TERMINEE' };
      const updatedMission = {
        ...existingMission,
        statut: 'TERMINE',
      };

      mockRepository.findOneBy.mockResolvedValue(existingMission);
      mockRepository.save.mockResolvedValue(updatedMission);

      const result = await service.updateById(1, updateData);

      expect(result.statut).toBe('TERMINE');
    });
  });

  describe('deleteById', () => {
    it('should delete a mission', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteById(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when mission not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteAll', () => {
    it('should delete all missions', async () => {
      mockRepository.clear.mockResolvedValue(undefined);

      await service.deleteAll();

      expect(mockRepository.clear).toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('should return the count of missions', async () => {
      mockRepository.count.mockResolvedValue(5);

      const result = await service.count();

      expect(result).toBe(5);
      expect(mockRepository.count).toHaveBeenCalled();
    });

    it('should return 0 when no missions exist', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await service.count();

      expect(result).toBe(0);
    });
  });

  describe('patchById', () => {
    it('should patch a mission with partial data', async () => {
      const existingMission = {
        id: 1,
        titre: 'Old Title',
        statut: 'EN_COURS',
        agentReferent: 'Agent A',
      };
      const patchData = { agentReferent: 'Agent B' };
      const patchedMission = { ...existingMission, ...patchData };

      mockRepository.findOneBy.mockResolvedValue(existingMission);
      mockRepository.save.mockResolvedValue(patchedMission);

      const result = await service.patchById(1, patchData);

      expect(result.agentReferent).toBe('Agent B');
    });
  });
});
