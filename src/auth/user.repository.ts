import {EntityRepository, Repository} from "typeorm";
import {UserEntity} from "./user.entity";
import {ConflictException, InternalServerErrorException} from "@nestjs/common";
import {AuthCredentialsDto} from "./dto/auth-credentials.dto";
import * as bcrypt from 'bcrypt';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        try {
            const {username, password} = authCredentialsDto;
            const user = this.create();
            user.username = username;
            user.salt = await bcrypt.genSalt(10);
            user.password = await this.hashPassword(password, user.salt);
            await user.save();
        } catch (error) {
            if (error.code === "23505") throw new ConflictException('Username already exist');
            throw new InternalServerErrorException()
        }
    }

    async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<string> {
        const {username, password} = authCredentialsDto;
        const user = await this.findOne({username});
        if (user && await user.validatePassword(password)) {
            return user.username;
        } else {
            return null;
        }
    }

    async hashPassword(password: string, salt: string): Promise<string> {
        return await bcrypt.hash(password, salt);
    }
}
