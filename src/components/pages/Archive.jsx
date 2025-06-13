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

const Archive = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortBy, setSortBy] = useState('archivedAt');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [archivedTasks, categoriesData] = await Promise.all([
          taskService.getArchived(),
          categoryService.getAll()
        ]);
        
        setTasks(archivedTasks);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message || 'Failed to load archived tasks');
        toast.error('Failed to load archived tasks');
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
        case 'archivedAt':
          return new Date(b.archivedAt) - new Date(a.archivedAt);
        
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
        task.categoryId === category.id
      ).length;
    });
    return counts;
  }, [tasks, categories]);

  // Calculate archive stats
  const archiveStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    const recent = tasks.filter(t => {
      if (!t.archivedAt) return false;
      const archived = parseISO(t.archivedAt);
      const daysSince = (new Date() - archived) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    }).length;

    return { total, completed, pending, recent };
  }, [tasks]);

  const handleRestoreTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to restore this task?')) {
      return;
    }

    // Optimistic update
    const taskToRestore = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      await taskService.restore(taskId);
      toast.success('Task restored successfully');
    } catch (error) {
      // Revert optimistic update
      if (taskToRestore) {
        setTasks(prev => [...prev, taskToRestore]);
      }
      toast.error('Failed to restore task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
      return;
    }

    // Optimistic update
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      await taskService.delete(taskId);
      toast.success('Task permanently deleted');
    } catch (error) {
      // Revert optimistic update
      if (taskToDelete) {
        setTasks(prev => [...prev, taskToDelete]);
      }
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    toast.info('Edit functionality coming soon!');
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
              <p className="text-sm text-gray-600 mt-1">Archived Tasks</p>
            </div>
            
            {/* Archive Overview */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Archive Overview</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Archived</span>
                  <span className="font-medium">{archiveStats.total}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-accent">{archiveStats.completed}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-warning">{archiveStats.pending}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Recent (7 days)</span>
                  <span className="font-medium text-primary">{archiveStats.recent}</span>
                </div>
              </div>
            </div>
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
                    Archived Tasks
                  </h2>
                  <p className="text-sm text-gray-600">
                    {filteredAndSortedTasks.length} archived tasks found
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <SearchBar
                      onSearch={setSearchQuery}
                      placeholder="Search archived tasks..."
                    />
                  </div>
                  <SortDropdown
                    currentSort={sortBy}
                    onSortChange={setSortBy}
                    options={[
                      { value: 'archivedAt', label: 'Date Archived' },
                      { value: 'dueDate', label: 'Due Date' },
                      { value: 'priority', label: 'Priority' },
                      { value: 'category', label: 'Category' },
                      { value: 'created', label: 'Date Created' }
                    ]}
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
              onRestoreTask={handleRestoreTask}
              loading={loading}
              showArchived={true}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Archive;