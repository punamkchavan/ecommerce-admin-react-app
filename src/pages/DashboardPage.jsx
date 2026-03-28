import React from 'react';
import { useSelector } from 'react-redux';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  const stats = [
    { label: 'Total Users', value: '1,234', trend: '+12%', color: 'bg-blue-500' },
    { label: 'Total Orders', value: '456', trend: '+5%', color: 'bg-green-500' },
    { label: 'Total Products', value: '89', trend: '+2%', color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back, {user?.displayName}!</h1>
        <p className="text-gray-500">Here's what's happening today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-xs font-semibold text-green-600 mt-1">{stat.trend} <span className="text-gray-400 font-normal">from last month</span></p>
            </div>
            <div className={`${stat.color} h-12 w-12 rounded-lg opacity-10 flex items-center justify-center`}>
              {/* Icon placeholder */}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-gray-900">Order Growth</h2>
          <select className="text-sm border-gray-200 rounded-md focus:ring-primary-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
        <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg bg-gray-50">
          <p className="text-gray-400 italic font-medium">Order Growth Line Graph (Recharts) will be integrated here</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
