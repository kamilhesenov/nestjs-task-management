import {Test} from '@nestjs/testing';
import {TasksService} from "./tasks.service";
import {TaskRepository} from "./task.repository";
import {GetTaskFilterDto} from "./dto/get-task-filter.dto";
import {TaskStatus} from "./task-status.enum";
import {NotFoundException} from "@nestjs/common";

const mockUser = {id: 12, username: 'Test user'};

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    findOne: jest.fn(),
    createTask: jest.fn(),
    deleteTask: jest.fn(),
})

describe('TasksService', () => {
    let tasksService;
    let taskRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                {provide: TaskRepository, useFactory: mockTaskRepository},
            ]
        }).compile();

        tasksService = module.get<TasksService>(TasksService);
        taskRepository = module.get<TaskRepository>(TaskRepository);
    });

    describe('getTasks', () => {
        it('get all tasks from the Repository', async () => {
            taskRepository.getTasks.mockResolvedValue('someValue');
            expect(taskRepository.getTasks).not.toHaveBeenCalled();
            const filters: GetTaskFilterDto = {status: TaskStatus.IN_PROGRESS, search: 'Some search query'}
            const result = await tasksService.getTasks(filters, mockUser);
            expect(taskRepository.getTasks).toHaveBeenCalled();
            expect(result).toEqual('someValue');
        })
    })

    describe('getTask', () => {
        it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
            const mockTask = {title: 'Test title', description: 'Test description'};
            taskRepository.findOne.mockResolvedValue(mockTask);
            const result = await tasksService.getTask(1, mockUser);
            expect(result).toEqual(mockTask);
            expect(taskRepository.findOne).toHaveBeenCalledWith({where: {id: 1, userId: mockUser.id}});
        });

        it('throws an error as task is not found', () => {
            taskRepository.findOne.mockResolvedValue(null);
            expect(tasksService.getTask(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    })

    describe('create', () => {
        it('calls taskRepository.create() and returns the result', async () => {
            taskRepository.createTask.mockResolvedValue('someTask');
            expect(taskRepository.createTask).not.toHaveBeenCalled();
            const createTaskDto = {title: 'Test title', description: 'Test description'}
            const result = await tasksService.create(createTaskDto, mockUser);
            expect(taskRepository.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
            expect(result).toEqual('someTask');
        })
    })

    describe('delete', () => {

        it('calls taskRepository.delete() to delete task', async () => {
            taskRepository.deleteTask.mockResolvedValue({affected: 1});
            expect(taskRepository.deleteTask).not.toHaveBeenCalled();
            const result = await tasksService.delete(1, mockUser);
            expect(taskRepository.deleteTask).toHaveBeenCalledWith({id: 1, userId: mockUser});
            expect(result).toEqual({affected: 1});
        });
        it('throws an error as task is not found', () => {
            taskRepository.deleteTask.mockResolvedValue({affected: 0});
            expect(tasksService.delete(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    })

    describe('update', () => {
        it('calls taskRepository.update() to update task', async () => {
            const save = jest.fn().mockResolvedValue(true);
            tasksService.getTask = jest.fn().mockResolvedValue({
                status: TaskStatus.OPEN,
                save,
            })
            expect(tasksService.getTask).not.toHaveBeenCalled();
            expect(save).not.toHaveBeenCalled();
            const result = await tasksService.update(1, TaskStatus.DONE, mockUser);
            expect(tasksService.getTask).toHaveBeenCalled();
            expect(save).toHaveBeenCalled();
            expect(result.status).toEqual(TaskStatus.DONE);
        })
    })
});
