import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _script } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_script);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // see if email is in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email in use');
    }

    // hash the users password
    // 1. generate a salt
    const salt = randomBytes(8).toString('hex');
    //   hash the salt and the password together
    const hashedPassword = (await scrypt(password, salt, 32)) as Buffer;
    // 2.join the hashed result and the salt together
    const result = `${salt}.${hashedPassword.toString('hex')}`;
    // 3.create a new user and save it
    const user = await this.usersService.create(email, result);

    // return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('Email in use');
    }

    const [salt, hashedPassword] = user.password.split('.');
    const hashedInputPassword = (await scrypt(password, salt, 32)) as Buffer;

    if (hashedInputPassword.toString('hex') !== hashedPassword) {
      throw new BadRequestException('Invalid password');
    }

    return user;
  }
}
