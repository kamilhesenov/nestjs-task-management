import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import * as bcrypt from 'bcrypt';
import {TaskEntity} from "../tasks/task.entity";

@Entity()
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    username: string;

    @Column()
    password: string;

    @Column()
    salt: string;

    @OneToMany(type => TaskEntity, task => task.user, {eager: true})
    tasks: TaskEntity[]

    async validatePassword(password: string): Promise<boolean> {
        const hash = await bcrypt.hash(password, this.salt);
        return hash === this.password;
    }
}
