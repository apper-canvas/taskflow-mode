import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

const RecurringTaskModal = ({ isOpen, onClose, onSubmit, categories = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 2,
    schedulePattern: 'daily',
    interval: 1,
    maxOccurrences: 5,
    endDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (formData.interval < 1) {
      toast.error('Interval must be at least 1');
      return;
    }

    if (!formData.maxOccurrences && !formData.endDate) {
      toast.error('Please set either max occurrences or end date');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const taskData = {
        ...formData,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };
      
      await onSubmit(taskData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        priority: 2,
        schedulePattern: 'daily',
        interval: 1,
        maxOccurrences: 5,
        endDate: ''
      });
      
      onClose();
    } catch (error) {
      toast.error('Failed to create recurring tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-semibold text-gray-900">Create Recurring Task</h2>
              <p className="text-sm text-gray-600 mt-1">Set up a task that repeats automatically</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Task Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title..."
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add task description..."
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <div className="flex space-x-3">
                {[
                  { value: 1, label: 'Low', color: '#10B981' },
                  { value: 2, label: 'Medium', color: '#F59E0B' },
                  { value: 3, label: 'High', color: '#EF4444' }
                ].map(priority => (
                  <motion.button
                    key={priority.value}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleInputChange('priority', priority.value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      formData.priority === priority.value
                        ? 'text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={formData.priority === priority.value ? { backgroundColor: priority.color } : {}}
                  >
                    {priority.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Pattern
                </label>
                <select
                  value={formData.schedulePattern}
                  onChange={(e) => handleInputChange('schedulePattern', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <Input
                label="Interval"
                type="number"
                min="1"
                value={formData.interval}
                onChange={(e) => handleInputChange('interval', parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Occurrences"
                type="number"
                min="1"
                max="100"
                value={formData.maxOccurrences}
                onChange={(e) => handleInputChange('maxOccurrences', parseInt(e.target.value) || '')}
                placeholder="5"
              />

              <Input
                label="End Date (Optional)"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <ApperIcon name="Info" className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Preview</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This will create {formData.maxOccurrences || '∞'} tasks repeating every {formData.interval} {formData.schedulePattern.slice(0, -2)}{formData.interval !== 1 ? 's' : ''}
                    {formData.endDate && ` until ${new Date(formData.endDate).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Recurring Tasks'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecurringTaskModal;