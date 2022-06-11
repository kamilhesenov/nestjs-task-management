import {Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {UserRepository} from "./user.repository";
import {InjectRepository} from "@nestjs/typeorm";
import {JwtService} from "@nestjs/jwt";
import {IJwtPayload} from "./jwt-payload.interface";
import {AuthCredentialsDto} from "./dto/auth-credentials.dto";

@Injectable()
export class AuthService {
    private readonly logger = new Logger('AuthService');

    constructor(
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService
    ) {
    }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return await this.userRepository.signUp(authCredentialsDto);
    }

    async sigIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        const username = await this.userRepository.validateUserPassword(authCredentialsDto);
        if (!username) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: IJwtPayload = {username};
        const accessToken = await this.jwtService.sign(payload);
        this.logger.debug(`Generated JWT token wit payload ${JSON.stringify(payload)}`)
        return {accessToken};
    }
}
