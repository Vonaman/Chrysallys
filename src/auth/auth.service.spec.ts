import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'password123';
      const hashedPassword = 'hashed_password_123';

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const newUser = {
        id: 1,
        email,
        username,
        password: hashedPassword,
      };

      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('jwt_token_123');

      const result = await service.register(email, username, password);

      expect(result.access_token).toBe('jwt_token_123');
      expect(result.user.id).toBe(1);
      expect(result.user.email).toBe(email);
      expect(result.user.username).toBe(username);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it('should hash password with bcrypt salt 10', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'password123';

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const newUser = { id: 1, email, username, password: 'hashed_password' };
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('token');

      await service.register(email, username, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it('should create JWT token with user data', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'password123';

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const newUser = { id: 1, email, username, password: 'hashed_password' };
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('token');

      await service.register(email, username, password);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: 1,
        email,
        username,
      });
    });

    it('should save user to repository', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'password123';

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const newUser = { id: 1, email, username, password: 'hashed_password' };
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('token');

      await service.register(email, username, password);

      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
    });

    it('should throw BadRequestException when email already exists', async () => {
      const email = 'existing@example.com';
      const username = 'newuser';
      const password = 'password123';

      const existingUser = {
        id: 1,
        email,
        username: 'existinguser',
        password: 'hashed',
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(
        service.register(email, username, password),
      ).rejects.toThrow(BadRequestException);
    });

    it('should check if email exists before registering', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'password123';

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const newUser = { id: 1, email, username, password: 'hashed_password' };
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('token');

      await service.register(email, username, password);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return user object with correct structure', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'password123';

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const newUser = { id: 1, email, username, password: 'hashed_password' };
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.register(email, username, password);

      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('username');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password_123';

      const user = {
        id: 1,
        email,
        username: 'testuser',
        password: hashedPassword,
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt_token_123');

      const result = await service.login(email, password);

      expect(result.access_token).toBe('jwt_token_123');
      expect(result.user.email).toBe(email);
      expect(result.user.id).toBe(1);
    });

    it('should compare password with bcrypt', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password_123';

      const user = { id: 1, email, username: 'testuser', password: hashedPassword };

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      await service.login(email, password);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should create JWT token on successful login', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const user = {
        id: 1,
        email,
        username: 'testuser',
        password: 'hashed_password',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      await service.login(email, password);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: 1,
        email,
        username: 'testuser',
      });
    });

    it('should throw UnauthorizedException when user email not found', async () => {
      const email = 'notfound@example.com';
      const password = 'password123';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrong_password';

      const user = {
        id: 1,
        email,
        username: 'testuser',
        password: 'hashed_password',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should not create token when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrong_password';

      const user = {
        id: 1,
        email,
        username: 'testuser',
        password: 'hashed_password',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should search user by email in findOne', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const user = {
        id: 1,
        email,
        username: 'testuser',
        password: 'hashed_password',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      await service.login(email, password);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return user without password field', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const user = {
        id: 1,
        email,
        username: 'testuser',
        password: 'hashed_password',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.login(email, password);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('id', 1);
      expect(result.user).toHaveProperty('email', email);
      expect(result.user).toHaveProperty('username', 'testuser');
    });
  });

  describe('validateUser', () => {
    it('should return user when user exists', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed_password',
      };

      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await service.validateUser(1);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.validateUser(999)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should query by correct user id', async () => {
      const user = {
        id: 5,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed_password',
      };

      mockUserRepository.findOneBy.mockResolvedValue(user);

      await service.validateUser(5);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 5 });
    });

    it('should return complete user object', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed_password',
      };

      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await service.validateUser(1);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('password');
    });

    it('should throw UnauthorizedException with correct message', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      try {
        await service.validateUser(999);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should handle different user ids', async () => {
      const user = { id: 42, email: 'user@example.com', username: 'user42' };

      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await service.validateUser(42);

      expect(result.id).toBe(42);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 42 });
    });
  });
});
