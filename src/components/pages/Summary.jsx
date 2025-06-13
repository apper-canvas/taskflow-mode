import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Chart from 'react-apexcharts';
import summaryService from '@/services/api/summaryService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const Summary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [overallStats, setOverallStats] = useState(null);

  // Load summary data
  useEffect(() => {
    const loadSummaryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [daily, weekly, categories, stats] = await Promise.all([
          summaryService.getDailySummary(7),
          summaryService.getWeeklySummary(4),
          summaryService.getCategoryBreakdown(),
          summaryService.getOverallStats()
        ]);
        
        setDailyData(daily);
        setWeeklyData(weekly);
        setCategoryData(categories);
        setOverallStats(stats);
      } catch (err) {
        setError(err.message || 'Failed to load summary data');
        toast.error('Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };

    loadSummaryData();
  }, []);

  // Chart configurations
  const progressChartOptions = useMemo(() => {
    const data = viewMode === 'daily' ? dailyData : weeklyData;
    
    return {
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      },
      colors: ['#5B21B6', '#10B981'],
      xaxis: {
        categories: data.map(d => d.label),
        labels: {
          style: { colors: '#6B7280', fontSize: '12px' }
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#6B7280', fontSize: '12px' }
        }
      },
      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 4
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right'
      },
      tooltip: {
        theme: 'light'
      }
    };
  }, [viewMode, dailyData, weeklyData]);

  const progressChartSeries = useMemo(() => {
    const data = viewMode === 'daily' ? dailyData : weeklyData;
    
    return [
      {
        name: 'Completed Tasks',
        data: data.map(d => d.completed)
      },
      {
        name: 'Total Due',
        data: data.map(d => d.total)
      }
    ];
  }, [viewMode, dailyData, weeklyData]);

  const categoryChartOptions = useMemo(() => ({
    chart: {
      type: 'donut',
      height: 350
    },
    labels: categoryData.map(cat => cat.name),
    colors: categoryData.map(cat => cat.color),
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(val)}%`
    },
    legend: {
      position: 'bottom'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Tasks',
              formatter: () => categoryData.reduce((sum, cat) => sum + cat.total, 0)
            }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: (val, { seriesIndex }) => {
          const category = categoryData[seriesIndex];
          return `${category.completed}/${category.total} tasks`;
        }
      }
    }
  }), [categoryData]);

  const categoryChartSeries = useMemo(() => 
    categoryData.map(cat => cat.completed), 
    [categoryData]
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="AlertCircle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Summary</h1>
              <p className="text-gray-600 mt-1">Analyze your productivity and progress</p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'daily' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('daily')}
                icon="Calendar"
              >
                Daily View
              </Button>
              <Button
                variant={viewMode === 'weekly' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('weekly')}
                icon="CalendarDays"
              >
                Weekly View
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Stats */}
            {overallStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-6 border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Progress</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {overallStats.today.completed}/{overallStats.today.due}
                      </p>
                      <p className="text-sm text-green-600">
                        {Math.round(overallStats.today.completionRate)}% complete
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <ApperIcon name="Calendar" className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6 border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Week</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {overallStats.week.completed}/{overallStats.week.due}
                      </p>
                      <p className="text-sm text-blue-600">
                        {Math.round(overallStats.week.completionRate)}% complete
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ApperIcon name="CalendarDays" className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-sm p-6 border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overall</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {overallStats.overall.completed}/{overallStats.overall.total}
                      </p>
                      <p className="text-sm text-purple-600">
                        {Math.round(overallStats.overall.completionRate)}% complete
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <ApperIcon name="CheckCircle" className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Progress Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6 border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewMode === 'daily' ? 'Daily' : 'Weekly'} Progress
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-600 rounded"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Total Due</span>
                  </div>
                </div>
              </div>
              
              {progressChartSeries.length > 0 && (
                <Chart
                  options={progressChartOptions}
                  series={progressChartSeries}
                  type="area"
                  height={350}
                />
              )}
            </motion.div>

            {/* Category Breakdown */}
            {categoryData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-6 border"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Completion by Category
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <Chart
                      options={categoryChartOptions}
                      series={categoryChartSeries}
                      type="donut"
                      height={350}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 mb-4">Category Details</h4>
                    {categoryData.map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <p className="text-sm text-gray-600">
                              {category.completed} of {category.total} tasks
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {Math.round(category.completionRate)}%
                          </p>
                          <p className="text-sm text-gray-600">complete</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;