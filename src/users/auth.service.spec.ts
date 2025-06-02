import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // create a fake copy of the users service
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('testemail@gmail.com', 'password');

    expect(user.password).not.toEqual('password');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    fakeUsersService.find = () =>
      // it does not matter what the email is here, since we are not checking it, we actually just want to return a user with a hard-coded password
      Promise.resolve([
        { email: 'test@email.com', password: 'salt.hashedPassword' } as User,
      ]);

    await expect(
      // it will not compare diffirent emails just the password
      service.signin('asdf@asdf.com', 'Password'),
    ).rejects.toThrow(BadRequestException);
  });

  // it('returns a user if correct password is provided', async () => {
  //   fakeUsersService.find = () =>
  //     Promise.resolve([
  //       {
  //         id: 1,
  //         email: 'asdf@asdf.com',
  //         password:
  //           '402ae9c7aab8560c.dfb7f467560f4cb7d4551bc2d1fdc0b07b94136bea9ea2dc4b93dddaf0af0d97',
  //       } as User,
  //     ]);

  //   const user = await service.signin('asdf@asdf.com', 'mypassword');
  //   expect(user).toBeDefined();
  // });

  // better way to write it
  it('returns a user if correct password is provided', async () => {
    const [email, password] = ['asdf@asdf.com', 'mypassword'];
    await service.signup(email, password);
    const user = await service.signin(email, password);
    expect(user).toBeDefined();
  });
});
