import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Patch,
    Query,
    UsePipes,
    ValidationPipe,
    ParseIntPipe, UseGuards, Logger
} from '@nestjs/common';
import {TasksService} from "./tasks.service";
import {CreateTaskDto} from "./dto/create-task.dto";
import {GetTaskFilterDto} from "./dto/get-task-filter.dto";
import {TaskStatusValidationPipe} from "./pipes/task-status-validation.pipe";
import {TaskEntity} from "./task.entity";
import {TaskStatus} from "./task-status.enum";
import {AuthGuard} from "@nestjs/passport";
import {GetUser} from "../auth/get-user.decorator";
import {UserEntity} from "../auth/user.entity";

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
    private readonly logger = new Logger('TasksController');

    constructor(private readonly tasksService: TasksService) {
    }

    @Get()
    findAllTasks(@Query(ValidationPipe) filterDto: GetTaskFilterDto, @GetUser() user: UserEntity): Promise<TaskEntity[]> {
        this.logger.verbose(`User ${user.username} retrieving all tasks. Filters: ${JSON.stringify(filterDto)}`)
        return this.tasksService.getTasks(filterDto, user);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createTask(@Body() createTaskDto: CreateTaskDto, @GetUser() user: UserEntity): Promise<TaskEntity> {
        this.logger.verbose(`User ${user.username} creating a new task. Data: ${JSON.stringify(createTaskDto)}`);
        return this.tasksService.create(createTaskDto, user);
    }

    @Get(':id')
    findTaskById(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity): Promise<TaskEntity> {
        this.logger.verbose(`User ${user.username} retrieving a task with Id ${id}`);
        return this.tasksService.getTask(id, user);
    }

    @Delete(':id')
    deleteTask(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity): Promise<string> {
        this.logger.verbose(`User ${user.username} delete a task with Id ${id}`);
        return this.tasksService.delete(id, user);
    }

    @Patch(':id/status')
    updateTask(@Param('id', ParseIntPipe) id: number, @Body('status', TaskStatusValidationPipe) status: TaskStatus, @GetUser() user: UserEntity): Promise<TaskEntity> {
        this.logger.verbose(`User ${user.username} update a task with Id ${id}. Status: ${status}`)
        return this.tasksService.update(id, status, user);
    }
}
