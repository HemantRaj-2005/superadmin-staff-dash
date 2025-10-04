// middleware/activityLogger.js
import ActivityLog from '../models/ActivityLog.js';

// export const logActivity = (action) => {
//   return async (req, res, next) => {
//     const originalJson = res.json;
    
//     res.json = function(data) {
//       // Log after response is sent
//       if (res.statusCode < 400) { // Only log successful actions
//         ActivityLog.create({
//           adminId: req.admin._id,
//           action,
//           targetUser: req.params.id || req.body.userId,
//           details: req.body,
//           ipAddress: req.ip,
//           userAgent: req.get('User-Agent')
//         }).catch(console.error);
//       }
      
//       originalJson.call(this, data);
//     };
    
//     next();
//   };
// };


// middleware/activityLogger.js - Add event actions
export const logActivity = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      if (res.statusCode < 400) {
        // Extract relevant details based on action type
        let details = {};
        
        if (action.includes('EVENT')) {
          details = {
            eventId: req.params.id,
            eventTitle: req.body.event_title || 'Unknown Event',
            changes: req.body
          };
        }
        
        ActivityLog.create({
          adminId: req.admin._id,
          action,
          targetUser: req.params.id,
          details,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }).catch(console.error);
      }
      
      originalJson.call(this, data);
    };
    
    next();
  };
};