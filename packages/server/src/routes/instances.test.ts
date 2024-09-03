import request from 'supertest';
import app from '../server'; // Assuming you have an Express app exported from app.ts
import Instance from '../models/Instance';
import Admin from '../models/Admin';

jest.mock('../models/Instance');
jest.mock('../models/Admin');

app.use((req: any, res: any, next: Function) => {
    req.auth = { userId: 1 };
    next();
  });

describe('POST /api/instances', () => {
  it.only('should create a new instance', async () => {
    const mockAdmin = { createInstance: jest.fn().mockResolvedValue({ id: 1, name: 'Test Instance' }) };
    (Admin.findByPk as jest.Mock).mockResolvedValue(mockAdmin);

    const response = await request(app)
      .post('/api/instances')
      .set('Authorization', 'Bearer valid-token') // Mock auth token
      .send({ name: 'Test Instance' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 1);
    expect(mockAdmin.createInstance).toHaveBeenCalledWith({ name: 'Test Instance' });
  });

  it('should return 404 if admin not found', async () => {
    (Admin.findByPk as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post('/instances')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Test Instance' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  // Add more tests for different scenarios
});