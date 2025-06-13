import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Checkbox = ({ checked, onChange, disabled = false, className = '' }) => {
  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-5 h-5 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
        checked 
          ? 'bg-primary border-primary' 
          : 'bg-white border-gray-300 hover:border-primary'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <motion.div
        initial={false}
        animate={checked ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <ApperIcon name="Check" className="w-3 h-3 text-white" />
      </motion.div>
    </motion.button>
  );
};

export default Checkbox;