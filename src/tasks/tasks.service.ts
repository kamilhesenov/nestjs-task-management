import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateTaskDto} from "./dto/create-task.dto";
import {GetTaskFilterDto} from "./dto/get-task-filter.dto";
import {TaskRepository} from "./task.repository";
import {InjectRepository} from "@nestjs/typeorm";
import {TaskEntity} from "./task.entity";
import {TaskStatus} from "./task-status.enum";
import {UserEntity} from "../auth/user.entity";

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskRepository)
        private readonly taskRepository: TaskRepository
    ) {
    }

    async getTasks(filterDto: GetTaskFilterDto, user: UserEntity): Promise<TaskEntity[]> {
        return await this.taskRepository.getTasks(filterDto, user);
    }

    async create(createTaskDto: CreateTaskDto, user: UserEntity): Promise<TaskEntity> {
        return await this.taskRepository.createTask(createTaskDto, user);
    }

    async getTask(id: number, user: UserEntity): Promise<TaskEntity> {
        const task = await this.taskRepository.findOne({where: {id, userId: user.id}});
        if (!task) throw new NotFoundException(`Task wit id ${id} Not Found`);
        return task;
    }

    async delete(id: number, user: UserEntity): Promise<string> {
        const {affected} = await this.taskRepository.delete({id, userId: user.id});
        if (!affected) throw new NotFoundException(`Task wit id ${id} Not Found`);
        return `Task wit id ${id} deleted`;
    }

    async update(id: number, status: TaskStatus, user: UserEntity): Promise<TaskEntity> {
        const task = await this.getTask(id, user);
        task.status = status;
        await task.save();
        return task;
    }
}
