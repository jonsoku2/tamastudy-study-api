import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../common/schemas/user.schema';
import { JoinRequestDto } from './dto/join.request.dto';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/user.response.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(dto: JoinRequestDto): Promise<UserResponseDto> {
    const { username, email, password } = dto;

    const foundUser = await this.userModel.findOne({ email });

    if (foundUser) {
      throw new ConflictException('이미 존재하는 유저입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new this.userModel({
      username,
      email,
      password: hashedPassword,
      islive: true,
    });

    await user.save();

    return user;
  }

  signOut(email: string) {
    try {
      return this.userModel.findOneAndUpdate(
        { email },
        { islive: true },
        { new: true },
      );
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err);
    }
  }
}
