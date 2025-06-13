import React from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isPast, parseISO } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Checkbox from '@/components/atoms/Checkbox';
import Badge from '@/components/atoms/Badge';

const TaskCard = ({ task, category, onToggleComplete, onEdit, onDelete }) => {
  const priorityColors = {
    1: '#10B981', // Low - Green
    2: '#F59E0B', // Medium - Amber
    3: '#EF4444'  // High - Red
  };

  const priorityLabels = {
    1: 'Low',
    2: 'Medium', 
    3: 'High'
  };

  const getBorderWidth = (priority) => {
    return priority === 3 ? 'border-l-4' : priority === 2 ? 'border-l-2' : 'border-l-1';
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isPast(date)) return `Overdue`;
    return format(date, 'MMM d');
  };

  const getDueDateColor = (dateString) => {
    if (!dateString) return 'text-gray-500';
    
    const date = parseISO(dateString);
    if (isPast(date) && !task.completed) return 'text-error';
    if (isToday(date)) return 'text-accent';
    return 'text-gray-500';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: task.completed ? 0.7 : 1, 
        y: 0,
        scale: task.completed ? 0.98 : 1
      }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 border-l-4 ${
        task.completed ? 'bg-gray-50' : ''
      }`}
      style={{ borderLeftColor: priorityColors[task.priority] }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <Checkbox
            checked={task.completed}
            onChange={onToggleComplete}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEdit}
                className="text-gray-400 hover:text-primary"
              >
                <ApperIcon name="Edit2" className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="text-gray-400 hover:text-error"
              >
                <ApperIcon name="Trash2" className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          
          {task.description && (
            <p className={`text-sm mt-1 ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              {category && (
                <Badge color={category.color} icon={category.icon}>
                  {category.name}
                </Badge>
              )}
              
              <Badge variant="default">
                {priorityLabels[task.priority]}
              </Badge>
            </div>
            
            {task.dueDate && (
              <div className={`flex items-center space-x-1 text-xs ${getDueDateColor(task.dueDate)}`}>
                <ApperIcon name="Calendar" className="w-3 h-3" />
                <span>{formatDueDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;