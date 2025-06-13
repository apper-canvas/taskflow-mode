import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const SortDropdown = ({ currentSort, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date', icon: 'Calendar' },
    { value: 'priority', label: 'Priority', icon: 'AlertCircle' },
    { value: 'category', label: 'Category', icon: 'Tag' },
    { value: 'status', label: 'Status', icon: 'CheckCircle' },
    { value: 'created', label: 'Created', icon: 'Clock' }
  ];

  const currentOption = sortOptions.find(option => option.value === currentSort);

  const handleSort = (value) => {
    onSortChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <ApperIcon name={currentOption?.icon || 'ArrowUpDown'} className="w-4 h-4 mr-2" />
        Sort: {currentOption?.label || 'None'}
        <ApperIcon name="ChevronDown" className="w-4 h-4 ml-2" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
            >
              <div className="py-1">
                {sortOptions.map(option => (
                  <motion.button
                    key={option.value}
                    whileHover={{ backgroundColor: '#F3F4F6' }}
                    onClick={() => handleSort(option.value)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                      currentSort === option.value 
                        ? 'text-primary bg-primary/5' 
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <ApperIcon name={option.icon} className="w-4 h-4 mr-3" />
                    {option.label}
                    {currentSort === option.value && (
                      <ApperIcon name="Check" className="w-4 h-4 ml-auto text-primary" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SortDropdown;