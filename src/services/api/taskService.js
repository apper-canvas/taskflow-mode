import taskData from '../mockData/tasks.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let tasks = [...taskData];

const taskService = {
  async getAll() {
    await delay(300);
    return [...tasks];
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(t => t.id === id);
    return task ? { ...task } : null;
  },

  async create(taskData) {
    await delay(250);
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description || '',
      categoryId: taskData.categoryId,
      priority: taskData.priority || 1,
      dueDate: taskData.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, updates) {
    await delay(200);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...tasks[index],
      ...updates,
      completedAt: updates.completed && !tasks[index].completed ? new Date().toISOString() : tasks[index].completedAt
    };
    
    tasks[index] = updatedTask;
    return { ...updatedTask };
  },

  async delete(id) {
    await delay(200);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    tasks.splice(index, 1);
    return true;
  },

  async getByCategory(categoryId) {
    await delay(250);
    return tasks.filter(t => t.categoryId === categoryId).map(t => ({ ...t }));
  },

  async getCompleted() {
    await delay(250);
    return tasks.filter(t => t.completed).map(t => ({ ...t }));
  },

async getPending() {
    await delay(250);
    return tasks.filter(t => !t.completed).map(t => ({ ...t }));
  },

  async archive(id) {
    await delay(200);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const archivedTask = {
      ...tasks[index],
      archived: true,
      archivedAt: new Date().toISOString()
    };
    
    tasks[index] = archivedTask;
    return { ...archivedTask };
  },

  async restore(id) {
    await delay(200);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const restoredTask = {
      ...tasks[index],
      archived: false,
      archivedAt: null
    };
    
    tasks[index] = restoredTask;
    return { ...restoredTask };
  },

  async getArchived() {
    await delay(250);
    return tasks.filter(t => t.archived).map(t => ({ ...t }));
  }
};

export default taskService;