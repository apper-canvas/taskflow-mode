import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange, taskCounts = {} }) => {
  const allCount = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-wrap gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onCategoryChange(null)}
        className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          activeCategory === null 
            ? 'bg-primary text-white shadow-md' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <ApperIcon name="Grid3X3" className="w-4 h-4 mr-2" />
        All
        {allCount > 0 && (
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            activeCategory === null 
              ? 'bg-white/20 text-white' 
              : 'bg-gray-300 text-gray-700'
          }`}>
            {allCount}
          </span>
        )}
      </motion.button>

      {categories.map(category => (
        <motion.button
          key={category.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(category.id)}
          className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeCategory === category.id 
              ? 'text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={activeCategory === category.id ? { backgroundColor: category.color } : {}}
        >
          <ApperIcon name={category.icon} className="w-4 h-4 mr-2" />
          {category.name}
          {taskCounts[category.id] > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeCategory === category.id 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-300 text-gray-700'
            }`}>
              {taskCounts[category.id]}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;