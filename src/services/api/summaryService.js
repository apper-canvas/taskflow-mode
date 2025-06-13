import { taskService, categoryService } from '@/services';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  eachWeekOfInterval,
  format,
  subDays,
  subWeeks,
  isWithinInterval
} from 'date-fns';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const summaryService = {
  async getDailySummary(days = 7) {
    await delay(300);
    
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    
    const tasks = await taskService.getAll();
    const categories = await categoryService.getAll();
    
    const dailyData = eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayTasks = tasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return isWithinInterval(completedDate, { start: dayStart, end: dayEnd });
      });
      
      const dueTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === dayStart.getTime();
      });
      
      return {
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'MMM dd'),
        completed: dayTasks.length,
        total: dueTasks.length,
        completionRate: dueTasks.length > 0 ? (dayTasks.length / dueTasks.length) * 100 : 0
      };
    });
    
    return dailyData;
  },

  async getWeeklySummary(weeks = 4) {
    await delay(350);
    
    const endDate = new Date();
    const startDate = subWeeks(endDate, weeks - 1);
    
    const tasks = await taskService.getAll();
    const categories = await categoryService.getAll();
    
    const weeklyData = eachWeekOfInterval({ start: startDate, end: endDate }).map(weekStart => {
      const weekEnd = endOfWeek(weekStart);
      
      const weekTasks = tasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return isWithinInterval(completedDate, { start: weekStart, end: weekEnd });
      });
      
      const dueThisWeek = tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return isWithinInterval(dueDate, { start: weekStart, end: weekEnd });
      });
      
      return {
        date: format(weekStart, 'yyyy-MM-dd'),
        label: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`,
        completed: weekTasks.length,
        total: dueThisWeek.length,
        completionRate: dueThisWeek.length > 0 ? (weekTasks.length / dueThisWeek.length) * 100 : 0
      };
    });
    
    return weeklyData;
  },

  async getCategoryBreakdown() {
    await delay(250);
    
    const tasks = await taskService.getAll();
    const categories = await categoryService.getAll();
    
    const categoryData = categories.map(category => {
      const categoryTasks = tasks.filter(task => task.categoryId === category.id);
      const completedTasks = categoryTasks.filter(task => task.completed);
      
      return {
        id: category.id,
        name: category.name,
        color: category.color,
        total: categoryTasks.length,
        completed: completedTasks.length,
        completionRate: categoryTasks.length > 0 ? (completedTasks.length / categoryTasks.length) * 100 : 0
      };
    });
    
    return categoryData.filter(cat => cat.total > 0);
  },

  async getOverallStats() {
    await delay(200);
    
    const tasks = await taskService.getAll();
    const now = new Date();
    
    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCompleted = tasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= today && completedDate < tomorrow;
    }).length;
    
    const todayDue = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    }).length;
    
    // This week's stats
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    
    const weekCompleted = tasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return isWithinInterval(completedDate, { start: weekStart, end: weekEnd });
    }).length;
    
    const weekDue = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return isWithinInterval(dueDate, { start: weekStart, end: weekEnd });
    }).length;
    
    return {
      today: {
        completed: todayCompleted,
        due: todayDue,
        completionRate: todayDue > 0 ? (todayCompleted / todayDue) * 100 : 0
      },
      week: {
        completed: weekCompleted,
        due: weekDue,
        completionRate: weekDue > 0 ? (weekCompleted / weekDue) * 100 : 0
      },
      overall: {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        completionRate: tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0
      }
    };
  }
};

export default summaryService;