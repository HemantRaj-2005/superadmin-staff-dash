// components/EventDetailModal.js
import React, { useState } from 'react';

const EventDetailModal = ({ event, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    event_title: event.event_title,
    event_description: event.event_description,
    event_type: event.event_type,
    location: event.location,
    is_paid: event.is_paid,
    price: event.price,
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
      price: event.price,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.event_title}
                    onChange={(e) => setEditData(prev => ({ ...prev, event_title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  event.event_title
                )}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Posted by: {event.posted_by}</span>
                <span>•</span>
                <span>Views: {event.views}</span>
                <span>•</span>
                <span>Code: {event.unique_event_code}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition duration-150"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                {isEditing ? (
                  <textarea
                    value={editData.event_description}
                    onChange={(e) => setEditData(prev => ({ ...prev, event_description: e.target.value }))}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{event.event_description}</p>
                )}
              </div>

              {/* Event Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.event_type}
                        onChange={(e) => setEditData(prev => ({ ...prev, event_type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{event.event_type}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{event.location}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editData.event_start_datetime}
                        onChange={(e) => setEditData(prev => ({ ...prev, event_start_datetime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formatDate(event.event_start_datetime)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editData.event_end_datetime}
                        onChange={(e) => setEditData(prev => ({ ...prev, event_end_datetime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formatDate(event.event_end_datetime)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Status</h3>
                {isEditing ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <div className={`px-4 py-2 rounded-lg text-center font-medium ${
                    event.status === 'active' ? 'bg-green-100 text-green-800' :
                    event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </div>
                )}
              </div>

              {/* Pricing Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Event Type:</span>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editData.is_paid}
                          onChange={(e) => setEditData(prev => ({ ...prev, is_paid: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm">Paid Event</span>
                      </div>
                    ) : (
                      <span className={`font-medium ${event.is_paid ? 'text-purple-600' : 'text-green-600'}`}>
                        {event.is_paid ? 'Paid' : 'Free'}
                      </span>
                    )}
                  </div>
                  
                  {(!isEditing ? event.is_paid : editData.is_paid) && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Price:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.price}
                          onChange={(e) => setEditData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-bold text-lg text-gray-900">${event.price}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150"
                    >
                      Edit Event
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-150"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;