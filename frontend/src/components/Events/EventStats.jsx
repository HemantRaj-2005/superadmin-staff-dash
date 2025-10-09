// components/EventStats.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '..//../services/api';

const EventStats = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    paidEvents: 0,
    activeEvents: 0,
    eventsByType: [],
    monthlyEvents: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/events/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching event stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Events */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Events</p>
            <p className="text-3xl font-bold mt-2">{stats.totalEvents}</p>
          </div>
          <div className="p-3 bg-blue-400 rounded-lg">
            <span className="text-2xl">📅</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Upcoming</p>
            <p className="text-3xl font-bold mt-2">{stats.upcomingEvents}</p>
          </div>
          <div className="p-3 bg-green-400 rounded-lg">
            <span className="text-2xl">⏰</span>
          </div>
        </div>
      </div>

      {/* Paid Events */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Paid Events</p>
            <p className="text-3xl font-bold mt-2">{stats.paidEvents}</p>
          </div>
          <div className="p-3 bg-purple-400 rounded-lg">
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>

      {/* Active Events */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium">Active</p>
            <p className="text-3xl font-bold mt-2">{stats.activeEvents}</p>
          </div>
          <div className="p-3 bg-orange-400 rounded-lg">
            <span className="text-2xl">✅</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventStats;