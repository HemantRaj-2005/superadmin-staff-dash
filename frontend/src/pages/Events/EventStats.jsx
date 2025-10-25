import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, CheckCircle } from 'lucide-react';
import api from '../../services/api';

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
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-400',
      iconColor: 'text-blue-100'
    },
    {
      title: 'Upcoming',
      value: stats.upcomingEvents,
      icon: Clock,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-400',
      iconColor: 'text-green-100'
    },
    {
      title: 'Paid Events',
      value: stats.paidEvents,
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-400',
      iconColor: 'text-purple-100'
    },
    {
      title: 'Active',
      value: stats.activeEvents,
      icon: CheckCircle,
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-400',
      iconColor: 'text-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index} className={`bg-gradient-to-br ${stat.gradient} text-white border-0 shadow-lg relative overflow-hidden`}>
          {/* Optional: Add subtle pattern overlay */}
          <div className="absolute inset-0 bg-black/5"></div>
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-medium mb-2">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold">
                  {stat.value}
                </p>
                <Badge 
                  variant="secondary" 
                  className="mt-2 bg-white/20 text-white border-0 hover:bg-white/30"
                >
                  Events
                </Badge>
              </div>
              <div className={`p-3 ${stat.iconBg} rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventStats;