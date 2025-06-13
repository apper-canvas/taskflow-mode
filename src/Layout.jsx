import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { routes } from '@/config/routes';
import ApperIcon from '@/components/ApperIcon';

function Layout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Navigation Header */}
      <header className="bg-surface border-b border-gray-200 px-6 py-4">
        <nav className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <ApperIcon name="CheckSquare" className="w-6 h-6 text-primary" />
            <span className="text-lg font-heading font-bold text-gray-900">TaskFlow</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {routes.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <ApperIcon name={route.icon} className="w-4 h-4" />
                <span>{route.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

export default Layout;