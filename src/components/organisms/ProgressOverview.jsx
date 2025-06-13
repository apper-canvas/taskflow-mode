import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

const ProgressOverview = ({ 
  totalTasks = 0, 
  completedTasks = 0, 
  todayTasks = 0, 
  overdueTasks = 0
}) => {
  const navigate = useNavigate();
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: 'CheckSquare',
      color: '#5B21B6'
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: 'CheckCircle',
      color: '#10B981'
    },
    {
      label: 'Due Today',
      value: todayTasks,
      icon: 'Calendar',
      color: '#F59E0B'
    },
    {
      label: 'Overdue',
      value: overdueTasks,
      icon: 'AlertCircle',
      color: '#EF4444'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6 border"
    >
      <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
        Progress Overview
      </h3>

      {/* Circular Progress */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 88 88">
            <circle
              cx="44"
              cy="44"
              r="40"
              stroke="#E5E7EB"
              strokeWidth="6"
              fill="transparent"
            />
            <motion.circle
              cx="44"
              cy="44"
              r="40"
              stroke="url(#progressGradient)"
              strokeWidth="6"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5B21B6" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900">
              {Math.round(completionRate)}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <ApperIcon 
                  name={stat.icon} 
                  className="w-4 h-4"
                  style={{ color: stat.color }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {stat.label}
              </span>
            </div>
            <span className="text-lg font-bold" style={{ color: stat.color }}>
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>

{/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/summary')}
            className="p-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <ApperIcon name="BarChart3" className="w-4 h-4 mx-auto mb-1" />
            Summary
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/archive')}
            className="p-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <ApperIcon name="Archive" className="w-4 h-4 mx-auto mb-1" />
            Archive
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressOverview;