import {EntityRepository, Repository} from "typeorm";
import {TaskEntity} from "./task.entity";
import {CreateTaskDto} from "./dto/create-task.dto";
import {TaskStatus} from "./task-status.enum";
import {GetTaskFilterDto} from "./dto/get-task-filter.dto";
import {UserEntity} from "../auth/user.entity";
import {InternalServerErrorException, Logger} from "@nestjs/common";

@EntityRepository(TaskEntity)
export class TaskRepository extends Repository<TaskEntity> {
    private readonly logger = new Logger('TaskRepository');

    async getTasks(filterDto: GetTaskFilterDto, user: UserEntity): Promise<TaskEntity[]> {
        try {
            const {status, search} = filterDto;
            const query = this.createQueryBuilder('task');

            query.where('task.userId = :userId', {userId: user.id})

            if (status) {
                query.andWhere('task.status = :status', {status});
            }

            if (search) {
                query.andWhere('(task.title LIKE :search OR task.description LIKE :search)', {search: `%${search}%`})
            }

            const tasks = await query.getMany();
            return tasks;
        } catch (error) {
            this.logger.error(`Failed te get tasks for user ${user.username}. Filters: ${JSON.stringify(filterDto)}`, error.stack)
            throw new InternalServerErrorException();
        }
    }

    async createTask(createTaskDto: CreateTaskDto, user: UserEntity): Promise<TaskEntity> {
        try {
            const {title, description} = createTaskDto;
            const task = new TaskEntity();
            task.title = title;
            task.description = description;
            task.status = TaskStatus.OPEN;
            task.user = user;
            await task.save();
            delete task.user;
            return task;
        } catch (error) {
            this.logger.error(`Failed to create a task for user ${user.username}. Data: ${JSON.stringify(createTaskDto)}`, error.stack)
            throw new InternalServerErrorException();
        }
    }
}
