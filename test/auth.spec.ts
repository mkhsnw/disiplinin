import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('AUTH TEST', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean up before each test
    await testService.deleteTestUser();
  });

  afterAll(async () => {
    await testService.deleteTestUser();
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should be rejected if request body is null', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: '',
          password: '',
          name: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should be rejected if email is not valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should be rejected if password is less than 6 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should be able to register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'test123',
          name: 'Test User',
        });

      logger.info('Register response:', response.body);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.name).toBe('Test User');
      expect(response.body.data.role).toBe('USER');
      expect(response.body.data.createdAt).toBeDefined();
      // Password should not be returned
      expect(response.body.data.password).toBeUndefined();
    });

    it('should be rejected if email already exists', async () => {
      await testService.createTestUser();

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'test123',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain(
        'Email or password is incorrect',
      );
    });
  });

  describe('POST /api/auth/login', () => {
    it('should be rejected if request body is null', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: '',
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should be rejected if email is not valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should be rejected if password is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should be rejected if user does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain(
        'Email or password is incorrect',
      );
    });

    it('should be rejected if password is incorrect', async () => {
      await testService.createTestUser();

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain(
        'Email or password is incorrect',
      );
    });

    it('should be able to login with valid credentials', async () => {
      await testService.createTestUser();

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'test123',
        });

      logger.info('Login response:', response.body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      // Check accessToken (not just 'token')
      expect(response.body.data.accessToken).toBeDefined();

      // Check user object
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.name).toBeDefined();
      expect(response.body.data.user.role).toBe('USER');

      // Password should not be in user object
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return valid JWT tokens on successful login', async () => {
      await testService.createTestUser();

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'test123',
        });

      expect(response.status).toBe(200);

      // Check accessToken format (JWT has 3 parts separated by dots)
      const accessTokenParts = response.body.data.accessToken.split('.');
      expect(accessTokenParts).toHaveLength(3);
    });
  });

  describe('Protected Routes', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create user and login to get token
      await testService.createTestUser();

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'test123',
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should be able to access protected route with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/current')
        .set('Authorization', `Bearer ${accessToken}`);

      logger.info('Current user response:', response.body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should be rejected when accessing protected route without token', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/auth/current',
      );

      expect(response.status).toBe(401);
    });

    it('should be rejected when accessing protected route with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/current')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
