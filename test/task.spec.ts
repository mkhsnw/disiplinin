// // test/task.spec.ts
// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
// import { AppModule } from '../src/app.module';
// import { Logger } from 'winston';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { TestModule } from './test.module';
// import { TestService } from './test.service';
// import { Priority, Status } from '@prisma/client';

// describe('TASK TEST', () => {
//   let app: INestApplication;
//   let logger: Logger;
//   let testService: TestService;
//   let accessToken: string;
//   let userId: string;

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule, TestModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     // Same setup as auth.spec.ts - no validation pipe
//     logger = app.get(WINSTON_MODULE_PROVIDER);
//     testService = app.get(TestService);
//     await app.init();
//   });

//   beforeEach(async () => {
//     // Clean up before each test - same as auth spec
//     await testService.deleteTestUser();

//     // Create test user and get token - same pattern as auth test
//     const user = await testService.createTestUser();
//     userId = user.id;

//     // Login to get access token - consistent with auth test
//     const loginResponse = await request(app.getHttpServer())
//       .post('/api/auth/login')
//       .send({
//         email: 'test@example.com',
//         password: 'test123',
//       });

//     accessToken = loginResponse.body.data.accessToken;
//   });

//   afterAll(async () => {
//     await testService.deleteTestUser();
//     await app.close();
//   });

//   describe('POST /api/tasks', () => {
//     it('should be rejected if request body is null', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/tasks')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({
//           title: '',
//           description: '',
//           priority: '',
//         });

//       expect(response.status).toBe(400);
//       expect(response.body.success).toBe(false);
//       expect(response.body.error).toBeDefined();
//     });

//     it('should be rejected if title is empty', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/tasks')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({
//           title: '',
//           description: 'Test description',
//           priority: Priority.HIGH,
//         });

//       expect(response.status).toBe(400);
//       expect(response.body.success).toBe(false);
//       expect(response.body.error).toBeDefined();
//     });

//     it('should be rejected if priority is invalid', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/tasks')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({
//           title: 'Test Task',
//           description: 'Test description',
//           priority: 'INVALID_PRIORITY',
//         });

//       expect(response.status).toBe(400);
//       expect(response.body.success).toBe(false);
//       expect(response.body.error).toBeDefined();
//     });

//     it('should be rejected without authentication', async () => {
//       const response = await request(app.getHttpServer())
//         .post('/api/tasks')
//         .send({
//           title: 'Test Task',
//           description: 'Test description',
//           priority: Priority.HIGH,
//         });

//       expect(response.status).toBe(401);
//     });

//     it('should be able to create a new task', async () => {
//       const taskData = {
//         title: 'Test Task',
//         description: 'This is a test task',
//         priority: Priority.HIGH,
//       };

//       const response = await request(app.getHttpServer())
//         .post('/api/tasks')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send(taskData)
//         .expect(201);

//       logger.info('Create task response:', response.body);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBeDefined();
//       expect(response.body.data.id).toBeDefined();
//       expect(response.body.data.title).toBe(taskData.title);
//       expect(response.body.data.description).toBe(taskData.description);
//       expect(response.body.data.priority).toBe(taskData.priority);
//       expect(response.body.data.status).toBe(Status.TODO);
//       expect(response.body.data.authorId).toBe(userId);
//       expect(response.body.data.createdAt).toBeDefined();
//       expect(response.body.data.updatedAt).toBeDefined();
//       expect(response.body.data.message).toBe('Task created successfully');
//     });
//   });

//   describe('GET /api/tasks', () => {
//     beforeEach(async () => {
//       // Create some test tasks
//       await testService.createTestTasks(userId, 3);
//     });

//     it('should get tasks list successfully', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/tasks')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .expect(200);

//       logger.info('Get tasks response:', response.body);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBeDefined();
//       expect(Array.isArray(response.body.data)).toBe(true);
//       expect(response.body.meta.pagination).toBeDefined();
//       expect(response.body.meta.pagination.total).toBeGreaterThan(0);
//     });

//     it('should handle pagination', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/tasks')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .query({ page: 1, limit: 2 })
//         .expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data.length).toBeLessThanOrEqual(2);
//       expect(response.body.meta.pagination.page).toBe(1);
//       expect(response.body.meta.pagination.limit).toBe(2);
//     });

//     it('should be rejected without authentication', async () => {
//       const response = await request(app.getHttpServer()).get('/api/tasks');

//       expect(response.status).toBe(401);
//     });
//   });

//   describe('GET /api/tasks/:id', () => {
//     let taskId: string;

//     beforeEach(async () => {
//       const task = await testService.createTestTask(userId);
//       taskId = task.id;
//     });

//     it('should get task detail successfully', async () => {
//       const response = await request(app.getHttpServer())
//         .get(`/api/tasks/${taskId}`)
//         .set('Authorization', `Bearer ${accessToken}`)
//         .expect(200);

//       logger.info('Get task detail response:', response.body);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBeDefined();
//       expect(response.body.data.id).toBe(taskId);
//       expect(response.body.data.title).toBeDefined();
//       expect(response.body.data.description).toBeDefined();
//       expect(response.body.data.author).toBeDefined();
//       expect(response.body.data.author.id).toBe(userId);
//       expect(response.body.data.commentsCount).toBeDefined();
//       expect(response.body.data.attachmentsCount).toBeDefined();
//       // Password should not be in author object
//       expect(response.body.data.author.password).toBeUndefined();
//     });

//     it('should return 404 for non-existent task', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/tasks/550e8400-e29b-41d4-a716-446655440000')
//         .set('Authorization', `Bearer ${accessToken}`);

//       expect(response.status).toBe(404);
//       expect(response.body.success).toBe(false);
//       expect(response.body.error).toBeDefined();
//       expect(response.body.error.message).toContain('Task not found');
//     });

//     it('should be rejected without authentication', async () => {
//       const response = await request(app.getHttpServer()).get(
//         `/api/tasks/${taskId}`,
//       );

//       expect(response.status).toBe(401);
//     });
//   });

//   describe('PUT /api/tasks/:id', () => {
//     let taskId: string;

//     beforeEach(async () => {
//       const task = await testService.createTestTask(userId);
//       taskId = task.id;
//     });

//     it('should update task successfully', async () => {
//       const updateData = {
//         title: 'Updated Task Title',
//         description: 'Updated description',
//         priority: Priority.CRITICAL,
//         status: Status.IN_PROGRESS,
//       };

//       const response = await request(app.getHttpServer())
//         .put(`/api/tasks/${taskId}`)
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send(updateData)
//         .expect(200);

//       logger.info('Update task response:', response.body);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data.id).toBe(taskId);
//       expect(response.body.data.title).toBe(updateData.title);
//       expect(response.body.data.description).toBe(updateData.description);
//       expect(response.body.data.priority).toBe(updateData.priority);
//       expect(response.body.data.status).toBe(updateData.status);
//       expect(response.body.data.message).toBe('Task updated successfully');
//     });

//     it('should return 404 for non-existent task', async () => {
//       const response = await request(app.getHttpServer())
//         .put('/api/tasks/550e8400-e29b-41d4-a716-446655440000')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({ title: 'Updated' });

//       expect(response.status).toBe(404);
//       expect(response.body.success).toBe(false);
//       expect(response.body.error).toBeDefined();
//     });

//     it('should be rejected without authentication', async () => {
//       const response = await request(app.getHttpServer())
//         .put(`/api/tasks/${taskId}`)
//         .send({ title: 'Updated' });

//       expect(response.status).toBe(401);
//     });
//   });

//   describe('DELETE /api/tasks/:id', () => {
//     let taskId: string;

//     beforeEach(async () => {
//       const task = await testService.createTestTask(userId);
//       taskId = task.id;
//     });

//     it('should delete task successfully by author', async () => {
//       const response = await request(app.getHttpServer())
//         .delete(`/api/tasks/${taskId}`)
//         .set('Authorization', `Bearer ${accessToken}`)
//         .expect(204);

//       // Verify task is deleted by trying to get it
//       const checkResponse = await request(app.getHttpServer())
//         .get(`/api/tasks/${taskId}`)
//         .set('Authorization', `Bearer ${accessToken}`);

//       expect(checkResponse.status).toBe(404);
//     });

//     it('should return 404 for non-existent task', async () => {
//       const response = await request(app.getHttpServer())
//         .delete('/api/tasks/550e8400-e29b-41d4-a716-446655440000')
//         .set('Authorization', `Bearer ${accessToken}`);

//       expect(response.status).toBe(404);
//       expect(response.body.success).toBe(false);
//       expect(response.body.error).toBeDefined();
//     });

//     it('should be rejected without authentication', async () => {
//       const response = await request(app.getHttpServer()).delete(
//         `/api/tasks/${taskId}`,
//       );

//       expect(response.status).toBe(401);
//     });
//   });

//   describe('Task Assignment', () => {
//     let taskId: string;
//     let assigneeId: string;

//     beforeEach(async () => {
//       const task = await testService.createTestTask(userId);
//       taskId = task.id;

//       const assignee = await testService.createTestAssignee();
//       assigneeId = assignee.id;
//     });

//     it('should assign task successfully', async () => {
//       const response = await request(app.getHttpServer())
//         .post(`/api/tasks/${taskId}/assign`)
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({ assigneeId })
//         .expect(200);

//       logger.info('Assign task response:', response.body);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data.id).toBe(taskId);
//       expect(response.body.data.assignee).toBeDefined();
//       expect(response.body.data.assignee.id).toBe(assigneeId);
//       expect(response.body.data.message).toBe('Task assigned successfully');
//     });

//     it('should be rejected if assigneeId is empty', async () => {
//       const response = await request(app.getHttpServer())
//         .post(`/api/tasks/${taskId}/assign`)
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({});

//       expect(response.status).toBe(400);
//       expect(response.body.success).toBe(false);
//     });

//     it('should be rejected if assignee does not exist', async () => {
//       const response = await request(app.getHttpServer())
//         .post(`/api/tasks/${taskId}/assign`)
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({ assigneeId: '550e8400-e29b-41d4-a716-446655440000' });

//       expect(response.status).toBe(404);
//       expect(response.body.success).toBe(false);
//       expect(response.body.error).toBeDefined();
//       expect(response.body.error.message).toContain('Assignee not found');
//     });
//   });

//   describe('Task Status Update', () => {
//     let taskId: string;

//     beforeEach(async () => {
//       const task = await testService.createTestTask(userId);
//       taskId = task.id;
//     });

//     it('should update task status successfully', async () => {
//       const response = await request(app.getHttpServer())
//         .put(`/api/tasks/${taskId}/status`)
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({ status: Status.IN_PROGRESS })
//         .expect(200);

//       logger.info('Update status response:', response.body);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data.id).toBe(taskId);
//       expect(response.body.data.status).toBe(Status.IN_PROGRESS);
//       expect(response.body.data.message).toBe(
//         'Task status updated successfully',
//       );
//     });

//     it('should be rejected if status is empty', async () => {
//       const response = await request(app.getHttpServer())
//         .put(`/api/tasks/${taskId}/status`)
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({});

//       expect(response.status).toBe(400);
//       expect(response.body.success).toBe(false);
//     });

//     it('should be rejected with invalid status', async () => {
//       const response = await request(app.getHttpServer())
//         .put(`/api/tasks/${taskId}/status`)
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({ status: 'INVALID_STATUS' });

//       expect(response.status).toBe(400);
//       expect(response.body.success).toBe(false);
//       expect(response.body.error).toBeDefined();
//     });
//   });

//   describe('Task Statistics', () => {
//     beforeEach(async () => {
//       // Create tasks with different statuses
//       await testService.createTestTasksWithStatuses(userId);
//     });

//     it('should get task stats successfully', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/tasks/stats/overview')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .expect(200);

//       logger.info('Task stats response:', response.body);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBeDefined();
//       expect(response.body.data.total).toBeGreaterThanOrEqual(0);
//       expect(response.body.data.todo).toBeGreaterThanOrEqual(0);
//       expect(response.body.data.inProgress).toBeGreaterThanOrEqual(0);
//       expect(response.body.data.review).toBeGreaterThanOrEqual(0);
//       expect(response.body.data.completed).toBeGreaterThanOrEqual(0);
//       expect(response.body.data.overdue).toBeGreaterThanOrEqual(0);
//     });

//     it('should be rejected without authentication', async () => {
//       const response = await request(app.getHttpServer()).get(
//         '/api/tasks/stats/overview',
//       );

//       expect(response.status).toBe(401);
//     });
//   });

//   describe('Overdue Tasks', () => {
//     beforeEach(async () => {
//       // Create overdue tasks
//       await testService.createOverdueTasks(userId);
//     });

//     it('should get overdue tasks successfully', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/tasks/overdue/list')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .expect(200);

//       logger.info('Overdue tasks response:', response.body);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBeDefined();
//       expect(Array.isArray(response.body.data)).toBe(true);
//       expect(response.body.meta.pagination).toBeDefined();

//       // Check overdue logic if there are tasks
//       if (response.body.data.length > 0) {
//         response.body.data.forEach((task: any) => {
//           expect(task.deadline).toBeDefined();
//           expect(new Date(task.deadline) < new Date()).toBe(true);
//           expect(task.status).not.toBe('COMPLETED');
//         });
//       }
//     });

//     it('should be rejected without authentication', async () => {
//       const response = await request(app.getHttpServer()).get(
//         '/api/tasks/overdue/list',
//       );

//       expect(response.status).toBe(401);
//     });
//   });

//   describe('Protected Routes', () => {
//     it('should be able to access task routes with valid token', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/tasks')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .expect(200);

//       expect(response.body.success).toBe(true);
//     });

//     it('should be rejected when accessing task routes without token', async () => {
//       const response = await request(app.getHttpServer()).get('/api/tasks');

//       expect(response.status).toBe(401);
//     });

//     it('should be rejected when accessing task routes with invalid token', async () => {
//       const response = await request(app.getHttpServer())
//         .get('/api/tasks')
//         .set('Authorization', 'Bearer invalid-token');

//       expect(response.status).toBe(401);
//     });
//   });
// });
