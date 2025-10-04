// components/ActivityLogs.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { admin } = useAuth();

  useEffect(() => {
    if (admin?.role === 'super_admin') {
      fetchLogs();
    }
  }, [admin]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/activity-logs');
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (admin?.role !== 'super_admin') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. Only super admins can view activity logs.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {log.adminId?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {log.adminId?.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.targetUser ? 
                    `${log.targetUser.firstName} ${log.targetUser.lastName}` : 
                    'N/A'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogs;