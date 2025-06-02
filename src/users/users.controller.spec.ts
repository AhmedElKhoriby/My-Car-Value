import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';
import e from 'express';

// We cannot test Decorators, Middlewares, HTTP requests/responses, Guards, or Interceptors in isolation.
// if we want to test them, we need to use Integration/E2E Testing.

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) =>
        Promise.resolve({
          id,
          email: 'test@email.com',
          password: 'hashedPassword',
        } as User),
      find: (email: string) =>
        Promise.resolve([{ id: 1, email, password: 'hashedPassword' } as User]),
      // update: () => {},
      // remove: () => {},
    };

    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) =>
        Promise.resolve({
          id: 1,
          email,
          password,
        } as User),
      // signout: () => {},
    };

    // isolated DI Container
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('test@email.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@email.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
    expect(user.email).toEqual('test@email.com');
  });

  // it('findUser throws an error if user with given id is not found', async () => {
  //   fakeUsersService.findOne = () => null;
  //   await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  // });

  // =============================================================

  // it('debugging - what does findUser return?', async () => {
  //   fakeUsersService.findOne = () => Promise.resolve(null);

  //   try {
  //     const result = await controller.findUser('1');
  //     console.log('Result:', result);
  //   } catch (error) {
  //     console.log('Error:', error);
  //   }
  // });

  // =============================================================

  it('throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => Promise.resolve(null);
    expect.assertions(1);
    await expect(controller.findUser('1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates session object and returns user', async () => {
    const session = { userId: null };
    const user = await controller.signIn(
      {
        email: 'test@email.com',
        password: 'password',
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(user.email).toEqual('test@email.com');
    expect(session.userId).not.toBeNull();
    expect(session.userId).toEqual(user.id);
  });
});
