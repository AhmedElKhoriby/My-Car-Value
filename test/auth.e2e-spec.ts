import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from '../src/setup-app';

describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('handles a signup request', async () => {
    const expectedEmail = 'test3@email.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: expectedEmail, password: 'pass1234' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toBe(expectedEmail);
      });
  });

  it('signup as a new user then get the currently logged in user', async () => {
    const email = 'test@example.com';
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'password123' })
      .expect(201);

    const cookie = res.get('Set-Cookie');
    expect(cookie).toBeDefined();

    await request(app.getHttpServer())
      .get('/auth/current-user')
      .set('Cookie', cookie)
      .expect(200)
      .then((res) => {
        expect(res.body.email).toEqual(email);
      });
  });
});
