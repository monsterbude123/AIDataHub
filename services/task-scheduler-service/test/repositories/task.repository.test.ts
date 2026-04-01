import { describe, it, expect, beforeEach } from 'vitest';

import {
  TaskEntity,
  TaskStatus,
  TaskType,
} from '../../src/modules/scheduler/entities/task.entity';
import { InMemoryTaskRepository } from '../../src/modules/scheduler/repositories/task.repository';

describe('InMemoryTaskRepository', () => {
  let repository: InMemoryTaskRepository;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
  });

  describe('create', () => {
    it('should create a task and return id', async () => {
      const task = new TaskEntity();
      task.name = 'Test Task';
      task.module = 'data-integration';
      task.type = TaskType.ONE_TIME;
      task.status = TaskStatus.READY;
      task.config = {};
      task.priority = 0;
      task.enabled = true;

      const result = await repository.create(task);

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
    });

    it('should set createdAt and updatedAt', async () => {
      const task = new TaskEntity();
      task.name = 'Test Task';
      task.module = 'data-integration';
      task.type = TaskType.ONE_TIME;
      task.status = TaskStatus.READY;
      task.config = {};
      task.priority = 0;
      task.enabled = true;

      const result = await repository.create(task);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findById', () => {
    it('should return task by id', async () => {
      const task = new TaskEntity();
      task.name = 'Test Task';
      task.module = 'test';
      task.type = TaskType.ONE_TIME;
      task.status = TaskStatus.READY;
      task.config = {};
      task.priority = 0;
      task.enabled = true;

      const created = await repository.create(task);
      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe('Test Task');
    });

    it('should return null for non-existent id', async () => {
      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('should return tasks by status', async () => {
      const task1 = new TaskEntity();
      task1.name = 'Ready Task 1';
      task1.module = 'test';
      task1.type = TaskType.ONE_TIME;
      task1.status = TaskStatus.READY;
      task1.config = {};
      task1.priority = 0;
      task1.enabled = true;

      const task2 = new TaskEntity();
      task2.name = 'Running Task';
      task2.module = 'test';
      task2.type = TaskType.ONE_TIME;
      task2.status = TaskStatus.RUNNING;
      task2.config = {};
      task2.priority = 0;
      task2.enabled = true;

      await repository.create(task1);
      await repository.create(task2);

      const readyTasks = await repository.findByStatus(TaskStatus.READY);

      expect(readyTasks).toHaveLength(1);
      expect(readyTasks[0].name).toBe('Ready Task 1');
    });
  });

  describe('update', () => {
    it('should update task', async () => {
      const task = new TaskEntity();
      task.name = 'Original Name';
      task.module = 'test';
      task.type = TaskType.ONE_TIME;
      task.status = TaskStatus.READY;
      task.config = {};
      task.priority = 0;
      task.enabled = true;

      const created = await repository.create(task);
      created.name = 'Updated Name';

      const success = await repository.update(created);
      const found = await repository.findById(created.id);

      expect(success).toBe(true);
      expect(found?.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete task', async () => {
      const task = new TaskEntity();
      task.name = 'To Delete';
      task.module = 'test';
      task.type = TaskType.ONE_TIME;
      task.status = TaskStatus.READY;
      task.config = {};
      task.priority = 0;
      task.enabled = true;

      const created = await repository.create(task);
      const success = await repository.delete(created.id);
      const found = await repository.findById(created.id);

      expect(success).toBe(true);
      expect(found).toBeNull();
    });
  });
});
