// routes/events.js
import express from 'express';
import Event from '../models/Event.js';
import ActivityLog from '../models/ActivityLog.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logActivity, logUpdateWithOldValues } from '../middleware/ActivityLogger.js';

const router = express.Router();

/* -------------------------
   Helpers: getEventForLogging, sanitize, diff
   ------------------------- */

const getEventForLogging = async (eventId) => {
  return await Event.findById(eventId);
};

const sensitiveFields = ['password', 'token', 'refreshToken', 'otp', 'otpVerificationId'];

const sanitizeBody = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(i => sanitizeBody(i));
  if (obj instanceof Date) return obj;
  const copy = {};
  for (const [k, v] of Object.entries(obj)) {
    if (sensitiveFields.includes(k)) copy[k] = '***HIDDEN***';
    else if (v && typeof v === 'object') copy[k] = sanitizeBody(v);
    else copy[k] = v;
  }
  return copy;
};

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

const isEqual = (a, b) => {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!isEqual(a[i], b[i])) return false;
    return true;
  }
  if (isObject(a) && isObject(b)) {
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (ak.length !== bk.length) return false;
    for (const k of ak) {
      if (!bk.includes(k)) return false;
      if (!isEqual(a[k], b[k])) return false;
    }
    return true;
  }
  return a === b;
};

const diffObjects = (oldObj = {}, newObj = {}) => {
  const oldValues = {};
  const newValues = {};

  const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

  keys.forEach((key) => {
    const a = oldObj ? oldObj[key] : undefined;
    const b = newObj ? newObj[key] : undefined;

    if (isObject(a) && isObject(b)) {
      const nested = diffObjects(a, b);
      if (Object.keys(nested.oldValues).length > 0) {
        oldValues[key] = nested.oldValues;
        newValues[key] = nested.newValues;
      }
    } else if (Array.isArray(a) && Array.isArray(b)) {
      if (!isEqual(a, b)) {
        oldValues[key] = a;
        newValues[key] = b;
      }
    } else {
      if (!isEqual(a, b)) {
        if (typeof a !== 'undefined') oldValues[key] = a;
        if (typeof b !== 'undefined') newValues[key] = b;
      }
    }
  });

  return { oldValues, newValues };
};

/* -------------------------
   Routes
   ------------------------- */

/**
 * GET /events
 * List events with filtering, pagination and available filters
 */
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
    if (event_type) query.event_type = event_type;
    if (status) query.status = status;
    if (is_paid !== '') query.is_paid = is_paid === 'true';
    
    if (date_range) {
      const [start, end] = date_range.split('_');
      query.event_start_datetime = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    const events = await Event.find(query)
      .sort({ event_start_datetime: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Event.countDocuments(query);

    // Get stats for filters
    const eventTypes = await Event.distinct('event_type');
    const statusTypes = await Event.distinct('status');

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
      filters: { eventTypes, statusTypes }
    });
  } catch (error) {
    console.error('GET /events error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /events/stats/overview
 * NOTE: placed BEFORE /:id so route isn't captured by :id
 */
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({
      event_start_datetime: { $gte: new Date() }
    });
    const paidEvents = await Event.countDocuments({ is_paid: true });
    const activeEvents = await Event.countDocuments({ status: 'active' });

    const eventsByType = await Event.aggregate([
      { $group: { _id: '$event_type', count: { $sum: 1 } } }
    ]);

    const monthlyEvents = await Event.aggregate([
      { $group: {
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

    res.json({ totalEvents, upcomingEvents, paidEvents, activeEvents, eventsByType, monthlyEvents });
  } catch (error) {
    console.error('GET /events/stats/overview error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /events/:id
 * Get single event
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error('GET /events/:id error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /events/:id
 * Update event and log only changed fields
 */
router.put(
  '/:id',
  authenticate,
  logUpdateWithOldValues('Event', getEventForLogging), // sets req.oldData (plain object)
  logActivity('UPDATE_EVENT', { resourceType: 'Event' }), // creates pending activity log
  async (req, res) => {
    try {
      // Validate & parse incoming fields (same validations as before)
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

      // Basic required fields check
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
        return res.status(400).json({ message: 'Start and end datetime are required' });
      }

      const startDate = new Date(event_start_datetime);
      const endDate = new Date(event_end_datetime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      if (endDate <= startDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
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

      // Preserve old copy from middleware (plain object)
      const oldEvent = req.oldData || {};

      const event = await Event.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!event) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { status: 'FAILED', description: `UPDATE_EVENT failed: event ${req.params.id} not found` }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Event not found' });
      }

      // Compute diffs between oldEvent and new saved event
      const newEventObj = event.toObject();
      const { oldValues, newValues } = diffObjects(oldEvent, newEventObj);

      const sanitizedOld = sanitizeBody(oldValues);
      const sanitizedNew = sanitizeBody(newValues);

      if (req.activityLogId && Object.keys(sanitizedOld).length > 0) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            changes: { oldValues: sanitizedOld, newValues: sanitizedNew },
            status: 'SUCCESS',
            description: `UPDATE_EVENT by ${req.admin?.name || 'Unknown Admin'} on event ${req.params.id}`
          }
        }).catch(console.error);
      } else if (req.activityLogId) {
        // No diffs detected
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'SUCCESS', description: `UPDATE_EVENT completed — no changes detected for event ${req.params.id}` }
        }).catch(console.error);
      }

      res.json(event);
    } catch (error) {
      console.error('PUT /events/:id error:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }

      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ message: 'Validation failed', errors });
      }

      if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * DELETE /events/:id
 * Delete event and record oldValues (full old doc) and newValues: null
 */
router.delete(
  '/:id',
  authenticate,
  logActivity('DELETE_EVENT', { resourceType: 'Event' }),
  async (req, res) => {
    try {
      // fetch old doc first
      const oldDoc = await getEventForLogging(req.params.id);
      if (!oldDoc) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { status: 'FAILED', description: 'DELETE_EVENT failed: not found' }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Event not found' });
      }

      const deleted = await Event.findByIdAndDelete(req.params.id);
      if (!deleted) {
        if (req.activityLogId) {
          await ActivityLog.findByIdAndUpdate(req.activityLogId, {
            $set: { status: 'FAILED', description: 'DELETE_EVENT failed during delete' }
          }).catch(console.error);
        }
        return res.status(404).json({ message: 'Event not found' });
      }

      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: {
            changes: { oldValues: sanitizeBody(oldDoc.toObject()), newValues: null },
            status: 'SUCCESS',
            description: `DELETE_EVENT by ${req.admin?.name || 'Unknown Admin'} on event ${req.params.id}`
          }
        }).catch(console.error);
      }

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('DELETE /events/:id error:', error);
      if (req.activityLogId) {
        await ActivityLog.findByIdAndUpdate(req.activityLogId, {
          $set: { status: 'FAILED', description: error.message }
        }).catch(console.error);
      }
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
