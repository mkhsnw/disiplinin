// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
// import { AppModule } from '../src/app.module';
// import { Logger } from 'winston';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { TestModule } from './test.module';
// import { TestService } from './test.service';

// describe('AUTH INTEGRATION TEST', () => {
//   let app: INestApplication;
//   let logger: Logger;
//   let testService: TestService;

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule, TestModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     // Note: No ValidationPipe here to match your setup
//     logger = app.get(WINSTON_MODULE_PROVIDER);
//     testService = app.get(TestService);
//     await app.init();
//   });

//   beforeEach(async () => {
//     // Clean up before each test
//     await testService.deleteTestUser();
//   });

//   afterAll(async () => {
//     await testService.deleteTestUser();
//     await app.close();
//   });

//   describe('POST /api/auth/register', () => {
//     it('should be rejected if request body is null', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send({
//           email: '',
//           password: '',
//           name: '',
//         });

//       logger.info('Empty register response:', response.body);

//       expect(response.status).toBe(500);
//       expect(response.body.message).toBe('Registration failed');
//     });

//     it('should be rejected if email is not valid', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send({
//           email: 'invalid-email',
//           password: 'password123',
//           name: 'Test User',
//         });

//       logger.info('Invalid email register response:', response.body);

//       expect(response.status).toBe(500);
//       expect(response.body.message).toBe('Registration failed');
//     });

//     it('should be rejected if password is less than 6 characters', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send({
//           email: 'test@example.com',
//           password: 'short',
//           name: 'Test User',
//         });

//       logger.info('Short password register response:', response.body);

//       expect(response.status).toBe(500);
//       expect(response.body.message).toBe('Registration failed');
//     });

//     it('should be rejected if name is empty', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send({
//           email: 'test@example.com',
//           password: 'test123',
//           name: '',
//         });

//       logger.info('Empty name register response:', response.body);

//       expect(response.status).toBe(500);
//       expect(response.body.message).toBe('Registration failed');
//     });

//     it('should be able to register a new user', async () => {
//       const registerData = {
//         email: 'test@example.com',
//         password: 'test123',
//         name: 'Test User',
//       };

//       const response = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send(registerData)
//         .expect(201);

//       logger.info('Successful register response:', response.body);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBeDefined();
//       expect(response.body.data.id).toBeDefined();
//       expect(response.body.data.email).toBe(registerData.email);
//       expect(response.body.data.name).toBe(registerData.name);
//       expect(response.body.data.createdAt).toBeDefined();
      
//       // Password should not be returned
//       expect(response.body.data.password).toBeUndefined();
//     });

//     it('should be rejected if email already exists', async () => {
//       // Create user first
//       await testService.createTestUser();

//       const response = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send({
//           email: 'test@example.com',
//           password: 'test123',
//           name: 'Test User',
//         });

//       logger.info('Duplicate email register response:', response.body);

//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe('User already exists');
//     });

//     it('should handle special characters in name', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send({
//           email: 'special@example.com',
//           password: 'test123',
//           name: 'Test User áéíóú ñ',
//         });

//       expect(response.status).toBe(201);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data.name).toBe('Test User áéíóú ñ');
//     });

//     it('should handle long email addresses', async () => {
//       const longEmail = 'verylongemailaddressthatistestingmaximumlengths@verylongdomainname.com';
      
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send({
//           email: longEmail,
//           password: 'test123',
//           name: 'Test User',
//         });

//       // This might pass or fail based on your validation rules
//       logger.info('Long email register response:', response.body);
//     });
//   });

//   describe('POST /api/auth/login', () => {
//     beforeEach(async () => {
//       // Create test user for login tests
//       await testService.createTestUser();
//     });

//     it('should be rejected if request body is null', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: '',
//           password: '',
//         });

//       logger.info('Empty login response:', response.body);

//       expect(response.status).toBe(500);
//       expect(response.body.message).toBe('Login failed');
//     });

//     it('should be rejected if email is not valid', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: 'invalid-email',
//           password: 'password123',
//         });

//       logger.info('Invalid email login response:', response.body);

//       expect(response.status).toBe(500);
//       expect(response.body.message).toBe('Login failed');
//     });

//     it('should be rejected if password is empty', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: 'test@example.com',
//           password: '',
//         });

//       logger.info('Empty password login response:', response.body);

//       expect(response.status).toBe(500);
//       expect(response.body.message).toBe('Login failed');
//     });

//     it('should be rejected if user does not exist', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: 'nonexistent@example.com',
//           password: 'password123',
//         });

//       logger.info('Non-existent user login response:', response.body);

//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe('Invalid email or password');
//     });

//     it('should be rejected if password is incorrect', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: 'test@example.com',
//           password: 'wrongpassword',
//         });

//       logger.info('Wrong password login response:', response.body);

//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe('Invalid email or password');
//     });

//     it('should be able to login with valid credentials', async () => {
//       const loginData = {
//         email: 'test@example.com',
//         password: 'test123',
//       };

//       const response = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send(loginData)
//         .expect(200);

//       logger.info('Successful login response:', response.body);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBeDefined();

//       // Check token
//       expect(response.body.data.token).toBeDefined();
//       expect(typeof response.body.data.token).toBe('string');

//       // Check user data (password should be excluded)
//       expect(response.body.data.id).toBeDefined();
//       expect(response.body.data.email).toBe(loginData.email);
//       expect(response.body.data.name).toBeDefined();
//       expect(response.body.data.createdAt).toBeDefined();

//       // Password should not be in response
//       expect(response.body.data.password).toBeUndefined();
//     });

//     it('should return valid JWT token on successful login', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: 'test@example.com',
//           password: 'test123',
//         })
//         .expect(200);

//       // Check token format (JWT has 3 parts separated by dots)
//       const token = response.body.data.token;
//       const tokenParts = token.split('.');
//       expect(tokenParts).toHaveLength(3);

//       // Verify JWT contains expected payload structure
//       const payload = JSON.parse(
//         Buffer.from(tokenParts[1], 'base64').toString(),
//       );
//       expect(payload.email).toBe('test@example.com');
//       expect(payload.id).toBeDefined();
//     });

//     it('should handle case sensitive email', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: 'TEST@EXAMPLE.COM', // Uppercase email
//           password: 'test123',
//         });

//       logger.info('Case sensitive email login response:', response.body);
      
//       // This will likely fail since emails are case sensitive in your implementation
//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe('Invalid email or password');
//     });

//     it('should handle sql injection attempts', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: "test@example.com'; DROP TABLE users; --",
//           password: 'test123',
//         });

//       // Should not crash the application
//       expect([400, 500]).toContain(response.status);
//     });
//   });

//   describe('GET /api/auth/current - Protected Route', () => {
//     let token: string;
//     let userData: any;

//     beforeEach(async () => {
//       // Create user and login to get token
//       const user = await testService.createTestUser();
//       userData = user;

//       const loginResponse = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: 'test@example.com',
//           password: 'test123',
//         });

//       token = loginResponse.body.data.token;
//     });

//     it('should be able to access protected route with valid token', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/auth/current')
//         .set('Authorization', `Bearer ${token}`)
//         .expect(200);

//       logger.info('Current user response:', response.body);

//       // Based on your auth decorator, this returns the decoded JWT payload
//       expect(response.body.email).toBe('test@example.com');
//       expect(response.body.id).toBeDefined();
//       expect(response.body.iat).toBeDefined(); // JWT issued at
//     });

//     it('should be rejected when accessing protected route without token', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/auth/current');

//       expect(response.status).toBe(401);
//     });

//     it('should be rejected when accessing protected route with invalid token', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/auth/current')
//         .set('Authorization', 'Bearer invalid-token');

//       expect(response.status).toBe(401);
//     });

//     it('should be rejected with malformed authorization header', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/auth/current')
//         .set('Authorization', 'InvalidFormat token');

//       expect(response.status).toBe(401);
//     });

//     it('should be rejected with missing Bearer prefix', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/auth/current')
//         .set('Authorization', token);

//       expect(response.status).toBe(401);
//     });

//     it('should be rejected with empty Authorization header', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/auth/current')
//         .set('Authorization', '');

//       expect(response.status).toBe(401);
//     });

//     it('should handle token with extra spaces', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/auth/current')
//         .set('Authorization', `Bearer   ${token}   `);

//       // Might work or fail depending on your JWT guard implementation
//       logger.info('Token with spaces response:', response.body);
//     });
//   });

//   describe('Authentication Flow Integration', () => {
//     it('should complete full registration and login flow', async () => {
//       const userData = {
//         email: 'integration@example.com',
//         password: 'integration123',
//         name: 'Integration Test User',
//       };

//       // Step 1: Register
//       const registerResponse = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send(userData)
//         .expect(201);

//       expect(registerResponse.body.success).toBe(true);
//       expect(registerResponse.body.data.email).toBe(userData.email);

//       // Step 2: Login with registered credentials
//       const loginResponse = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: userData.email,
//           password: userData.password,
//         })
//         .expect(200);

//       expect(loginResponse.body.success).toBe(true);
//       expect(loginResponse.body.data.token).toBeDefined();

//       // Step 3: Access protected route
//       const currentUserResponse = await request(app.getHttpServer())
//         .get('/api/auth/current')
//         .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
//         .expect(200);

//       expect(currentUserResponse.body.email).toBe(userData.email);
//       expect(currentUserResponse.body.id).toBeDefined();
//     });

//     it('should handle user lifecycle - register, login, access protected routes', async () => {
//       const email = 'lifecycle@example.com';
//       const password = 'lifecycle123';
//       const name = 'Lifecycle User';

//       // Register
//       await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send({ email, password, name })
//         .expect(201);

//       // Login
//       const loginResponse = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({ email, password })
//         .expect(200);

//       const token = loginResponse.body.data.token;

//       // Multiple protected route accesses
//       for (let i = 0; i < 3; i++) {
//         await request(app.getHttpServer())
//           .get('/api/auth/current')
//           .set('Authorization', `Bearer ${token}`)
//           .expect(200);
//       }
//     });

//     it('should handle concurrent registration attempts for same email', async () => {
//       const userData = {
//         email: 'concurrent@example.com',
//         password: 'concurrent123',
//         name: 'Concurrent User',
//       };

//       // Try to register the same user simultaneously
//       const promises = Array(3).fill(null).map(() =>
//         request(app.getHttpServer())
//           .post('/api/auth/register')
//           .send(userData)
//       );

//       const responses = await Promise.all(promises);

//       // Only one should succeed (201), others should fail (400 or 500)
//       const successfulResponses = responses.filter(r => r.status === 201);
//       const failedResponses = responses.filter(r => r.status !== 201);

//       expect(successfulResponses).toHaveLength(1);
//       expect(failedResponses.length).toBeGreaterThanOrEqual(2);
//     });
//   });

//   describe('Error Handling and Edge Cases', () => {
//     it('should handle missing request body gracefully', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/register');

//       expect([400, 500]).toContain(response.status);
//       expect(response.body.message).toBeDefined();
//     });

//     it('should handle malformed JSON gracefully', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .set('Content-Type', 'application/json')
//         .send('{ invalid json }');

//       expect([400, 500]).toContain(response.status);
//     });

//     it('should handle very long passwords', async () => {
//       const longPassword = 'a'.repeat(1000); // 1000 character password
      
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send({
//           email: 'longpass@example.com',
//           password: longPassword,
//           name: 'Long Password User',
//         });

//       // Should handle gracefully, might succeed or fail based on validation
//       logger.info('Long password response:', response.body);
//     });

//     it('should handle empty strings in all fields', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: '',
//           password: '',
//         });

//       expect(response.status).toBe(500);
//       expect(response.body.message).toBe('Login failed');
//     });

//     it('should handle null values in request', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send({
//           email: null,
//           password: null,
//           name: null,
//         });

//       expect([400, 500]).toContain(response.status);
//     });

//     it('should handle undefined values in request', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: undefined,
//           password: undefined,
//         });

//       expect([400, 500]).toContain(response.status);
//     });
//   });

//   describe('Security Tests', () => {
//     beforeEach(async () => {
//       await testService.createTestUser();
//     });

//     it('should not expose password in any response', async () => {
//       // Test registration
//       const registerResponse = await request(app.getHttpServer())
//         .post('/api/auth/register')
//         .send({
//           email: 'security@example.com',
//           password: 'security123',
//           name: 'Security User',
//         });

//       if (registerResponse.status === 201) {
//         expect(registerResponse.body.data.password).toBeUndefined();
//       }

//       // Test login
//       const loginResponse = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: 'test@example.com',
//           password: 'test123',
//         });

//       if (loginResponse.status === 200) {
//         expect(loginResponse.body.data.password).toBeUndefined();
//       }
//     });

//     it('should not reveal user existence through different error messages', async () => {
//       // Login with non-existent user
//       const response1 = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: 'nonexistent@example.com',
//           password: 'wrongpassword',
//         });

//       // Login with existing user but wrong password
//       const response2 = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: 'test@example.com',
//           password: 'wrongpassword',
//         });

//       // Both should return the same error message
//       expect(response1.body.message).toBe(response2.body.message);
//     });

//     it('should have consistent response times for existing and non-existing users', async () => {
//       const startTime1 = Date.now();
//       await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: 'nonexistent@example.com',
//           password: 'password123',
//         });
//       const duration1 = Date.now() - startTime1;

//       const startTime2 = Date.now();
//       await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({
//           email: 'test@example.com',
//           password: 'wrongpassword',
//         });
//       const duration2 = Date.now() - startTime2;

//       // Response times should be relatively similar (within 1 second difference)
//       const timeDiff = Math.abs(duration1 - duration2);
//       expect(timeDiff).toBeLessThan(1000);
//     });
//   });

//   describe('Performance and Load', () => {
//     it('should handle multiple concurrent login attempts', async () => {
//       await testService.createTestUser();

//       const promises = Array(10).fill(null).map(() =>
//         request(app.getHttpServer())
//           .post('/api/auth/login')
//           .send({
//             email: 'test@example.com',
//             password: 'test123',
//           })
//       );

//       const responses = await Promise.all(promises);
      
//       // All should succeed
//       responses.forEach(response => {
//         expect(response.status).toBe(200);
//         expect(response.body.success).toBe(true);
//       });
//     });

//     it('should handle sequential requests efficiently', async () => {
//       await testService.createTestUser();

//       const startTime = Date.now();
      
//       for (let i = 0; i < 5; i++) {
//         await request(app.getHttpServer())
//           .post('/api/auth/login')
//           .send({
//             email: 'test@example.com',
//             password: 'test123',
//           })
//           .expect(200);
//       }

//       const totalTime = Date.now() - startTime;
      
//       // Should complete 5 requests reasonably quickly (under 5 seconds)
//       expect(totalTime).toBeLessThan(5000);
      
//       logger.info(`5 sequential login requests completed in ${totalTime}ms`);
//     });
//   });
// });