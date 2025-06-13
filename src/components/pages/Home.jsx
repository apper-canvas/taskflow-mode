import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { isToday, isPast, parseISO } from 'date-fns';
import { taskService, categoryService } from '@/services';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import CategoryFilter from '@/components/molecules/CategoryFilter';
import SortDropdown from '@/components/molecules/SortDropdown';
import TaskList from '@/components/organisms/TaskList';
import AddTaskForm from '@/components/organisms/AddTaskForm';
import ProgressOverview from '@/components/organisms/ProgressOverview';

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortBy, setSortBy] = useState('dueDate');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [tasksData, categoriesData] = await Promise.all([
          taskService.getAll(),
          categoryService.getAll()
        ]);
        
        setTasks(tasksData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message || 'Failed to load data');
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (activeCategory) {
      filtered = filtered.filter(task => task.categoryId === activeCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        
        case 'priority':
          return b.priority - a.priority;
        
        case 'category':
          const catA = categories.find(c => c.id === a.categoryId)?.name || '';
          const catB = categories.find(c => c.id === b.categoryId)?.name || '';
          return catA.localeCompare(catB);
        
        case 'status':
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
        
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchQuery, activeCategory, sortBy, categories]);

  // Calculate task counts for category filter
  const taskCounts = useMemo(() => {
    const counts = {};
    categories.forEach(category => {
      counts[category.id] = tasks.filter(task => 
        task.categoryId === category.id && !task.completed
      ).length;
    });
    return counts;
  }, [tasks, categories]);

  // Calculate progress stats
  const progressStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const today = tasks.filter(t => 
      t.dueDate && isToday(parseISO(t.dueDate)) && !t.completed
    ).length;
    const overdue = tasks.filter(t => 
      t.dueDate && isPast(parseISO(t.dueDate)) && !t.completed && !isToday(parseISO(t.dueDate))
    ).length;

    return { total, completed, today, overdue };
  }, [tasks]);

  // Task operations
  const handleAddTask = async (taskData) => {
    try {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      throw error;
    }
  };

  const handleToggleComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistic update
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));

    try {
      await taskService.update(taskId, { completed: !task.completed });
      toast.success(task.completed ? 'Task marked as pending' : 'Task completed! 🎉');
    } catch (error) {
      // Revert optimistic update
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: task.completed } : t
      ));
      toast.error('Failed to update task');
    }
  };

  const handleEditTask = (task) => {
    // For now, we'll just show a toast - editing would need a separate form
    toast.info('Edit functionality coming soon!');
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    // Optimistic update
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      await taskService.delete(taskId);
      toast.success('Task deleted successfully');
    } catch (error) {
      // Revert optimistic update
      if (taskToDelete) {
        setTasks(prev => [...prev, taskToDelete]);
      }
      toast.error('Failed to delete task');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-screen flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-surface border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-heading font-bold text-gray-900">TaskFlow</h1>
              <p className="text-sm text-gray-600 mt-1">Organize and complete daily tasks</p>
            </div>
            
            <ProgressOverview {...progressStats} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-full">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-gray-900">
                    Your Tasks
                  </h2>
                  <p className="text-sm text-gray-600">
                    {filteredAndSortedTasks.length} tasks found
                  </p>
                </div>
                
                <Button
                  icon="Plus"
                  onClick={() => setShowAddForm(true)}
                  className="shadow-md"
                >
                  Add Task
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <SearchBar
                      onSearch={setSearchQuery}
                      placeholder="Search tasks..."
                    />
                  </div>
                  <SortDropdown
                    currentSort={sortBy}
                    onSortChange={setSortBy}
                  />
                </div>

                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  taskCounts={taskCounts}
                />
              </div>
            </div>

            {/* Task List */}
            <TaskList
              tasks={filteredAndSortedTasks}
              categories={categories}
              onToggleComplete={handleToggleComplete}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              loading={loading}
            />
          </div>
        </main>
      </div>

      {/* Add Task Form Modal */}
      <AddTaskForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddTask}
        categories={categories}
      />
    </div>
  );
};

export default Home;