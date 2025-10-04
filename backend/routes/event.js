// routes/events.js
import express from 'express';
import Event from '../models/Event.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/ActivityLogger.js';

const router = express.Router();

// Get all events with advanced filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      event_type = '', 
      status = '',
      date_range = '',
      is_paid = ''
    } = req.query;
    
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { event_title: { $regex: search, $options: 'i' } },
        { event_description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Event type filter
    if (event_type) {
      query.event_type = event_type;
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Paid/Free filter
    if (is_paid !== '') {
      query.is_paid = is_paid === 'true';
    }
    
    // Date range filter
    if (date_range) {
      const [start, end] = date_range.split('_');
      query.event_start_datetime = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    const events = await Event.find(query)
      .sort({ event_start_datetime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    // Get stats for filters
    const eventTypes = await Event.distinct('event_type');
    const statusTypes = await Event.distinct('status');

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      filters: {
        eventTypes,
        statusTypes
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event
router.put('/:id', authenticate, logActivity('UPDATE_EVENT'), async (req, res) => {
  try {
    const {
      event_title,
      event_description,
      event_type,
      location,
      is_paid,
      price,
      event_start_datetime,
      event_end_datetime,
      status
    } = req.body;

    // Basic validation
    if (!event_title || !event_description || !event_type || !location) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        missing: []
          .concat(!event_title ? 'event_title' : [])
          .concat(!event_description ? 'event_description' : [])
          .concat(!event_type ? 'event_type' : [])
          .concat(!location ? 'location' : [])
      });
    }

    // Date validation
    if (!event_start_datetime || !event_end_datetime) {
      return res.status(400).json({ 
        message: 'Start and end datetime are required' 
      });
    }

    const startDate = new Date(event_start_datetime);
    const endDate = new Date(event_end_datetime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid date format' 
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ 
        message: 'End date must be after start date' 
      });
    }

    const updateData = {
      event_title,
      event_description,
      event_type,
      location,
      is_paid: Boolean(is_paid),
      price: is_paid ? Number(price) || 0 : 0,
      event_start_datetime: startDate,
      event_end_datetime: endDate,
      status: status || 'active'
    };

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', authenticate, logActivity('DELETE_EVENT'), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get event statistics
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({
      event_start_datetime: { $gte: new Date() }
    });
    const paidEvents = await Event.countDocuments({ is_paid: true });
    const activeEvents = await Event.countDocuments({ status: 'active' });
    
    // Events by type
    const eventsByType = await Event.aggregate([
      {
        $group: {
          _id: '$event_type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Monthly events
    const monthlyEvents = await Event.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$event_start_datetime' },
            month: { $month: '$event_start_datetime' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalEvents,
      upcomingEvents,
      paidEvents,
      activeEvents,
      eventsByType,
      monthlyEvents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;