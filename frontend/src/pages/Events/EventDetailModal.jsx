import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Edit, 
  Save, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Eye,
  User,
  Hash
} from 'lucide-react';

const EventDetailModal = ({ event, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    event_title: event.event_title,
    event_description: event.event_description,
    event_type: event.event_type,
    location: event.location,
    is_paid: event.is_paid,
    price: event.price || 0,
    event_start_datetime: event.event_start_datetime.split('T')[0],
    event_end_datetime: event.event_end_datetime.split('T')[0],
    status: event.status
  });

  const handleSave = async () => {
    try {
      await onUpdate(event._id, {
        ...editData,
        event_start_datetime: new Date(editData.event_start_datetime),
        event_end_datetime: new Date(editData.event_end_datetime)
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      event_title: event.event_title,
      event_description: event.event_description,
      event_type: event.event_type,
      location: event.location,
      is_paid: event.is_paid,
      price: event.price || 0,
      event_start_datetime: event.event_start_datetime.split('T')[0],
      event_end_datetime: event.event_end_datetime.split('T')[0],
      status: event.status
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusVariant = (status) => {
    const statusMap = {
      active: 'default',
      draft: 'secondary',
      cancelled: 'destructive',
      completed: 'outline'
    };
    return statusMap[status] || 'secondary';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? (
                  <Input
                    value={editData.event_title}
                    onChange={(e) => setEditData(prev => ({ ...prev, event_title: e.target.value }))}
                    className="text-2xl font-bold"
                  />
                ) : (
                  event.event_title
                )}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>Posted by: {event.posted_by}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>Views: {event.views}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center space-x-1">
                  <Hash className="h-3 w-3" />
                  <span>Code: {event.unique_event_code}</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Card */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editData.event_description}
                      onChange={(e) => setEditData(prev => ({ ...prev, event_description: e.target.value }))}
                      rows={6}
                      className="resize-none"
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {event.event_description}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Event Details Card */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Event Type */}
                    <div className="space-y-2">
                      <Label htmlFor="event-type">Event Type</Label>
                      {isEditing ? (
                        <Input
                          id="event-type"
                          value={editData.event_type}
                          onChange={(e) => setEditData(prev => ({ ...prev, event_type: e.target.value }))}
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white font-medium">{event.event_type}</p>
                      )}
                    </div>
                    
                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={editData.location}
                          onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Start Date & Time */}
                    <div className="space-y-2">
                      <Label htmlFor="start-datetime">Start Date & Time</Label>
                      {isEditing ? (
                        <Input
                          id="start-datetime"
                          type="datetime-local"
                          value={editData.event_start_datetime}
                          onChange={(e) => setEditData(prev => ({ ...prev, event_start_datetime: e.target.value }))}
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.event_start_datetime)}</span>
                        </div>
                      )}
                    </div>

                    {/* End Date & Time */}
                    <div className="space-y-2">
                      <Label htmlFor="end-datetime">End Date & Time</Label>
                      {isEditing ? (
                        <Input
                          id="end-datetime"
                          type="datetime-local"
                          value={editData.event_end_datetime}
                          onChange={(e) => setEditData(prev => ({ ...prev, event_end_datetime: e.target.value }))}
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.event_end_datetime)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Event Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Select
                      value={editData.status}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getStatusVariant(event.status)} className="text-sm">
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Card */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="paid-event" className="text-sm">Paid Event</Label>
                    {isEditing ? (
                      <Switch
                        id="paid-event"
                        checked={editData.is_paid}
                        onCheckedChange={(checked) => setEditData(prev => ({ ...prev, is_paid: checked }))}
                      />
                    ) : (
                      <Badge variant={event.is_paid ? "default" : "secondary"}>
                        {event.is_paid ? 'Paid' : 'Free'}
                      </Badge>
                    )}
                  </div>
                  
                  {(!isEditing ? event.is_paid : editData.is_paid) && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <Input
                            id="price"
                            type="number"
                            value={editData.price}
                            onChange={(e) => setEditData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                            className="flex-1"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-6 w-6 text-green-600" />
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${event.price}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="w-full flex items-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Event</span>
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleSave}
                          className="w-full flex items-center space-x-2"
                        >
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;