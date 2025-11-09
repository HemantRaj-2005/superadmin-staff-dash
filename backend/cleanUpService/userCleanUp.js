// services/userCleanupService.js
import User from '../models/User.js';
import cron from 'node-cron';

class UserCleanupService {
  constructor() {
    this.isRunning = false;
  }

  // Permanently delete users that were soft-deleted more than 90 days ago
  async permanentDeleteOldUsers() {
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const usersToDelete = await User.findDeleted({
        deletedAt: { $lte: ninetyDaysAgo }
      });

      if (usersToDelete.length === 0) {
        console.log('No users found for permanent deletion');
        return { deletedCount: 0 };
      }

      const userIds = usersToDelete.map(user => user._id);
      
      // Perform actual deletion
      const result = await User.deleteMany({
        _id: { $in: userIds },
        isDeleted: true,
        deletedAt: { $lte: ninetyDaysAgo }
      });

      console.log(`Permanently deleted ${result.deletedCount} users that were soft-deleted more than 90 days ago`);
      
      // Log the deletion (you might want to save this to a separate audit collection)
      await this.logPermanentDeletions(userIds);

      return result;
    } catch (error) {
      console.error('Error in permanentDeleteOldUsers:', error);
      throw error;
    }
  }

  // Get users scheduled for permanent deletion (for admin view)
  async getUsersScheduledForDeletion() {
    try {
      const users = await User.findDeleted({
        scheduledForPermanentDeletion: { $ne: null }
      }).sort({ scheduledForPermanentDeletion: 1 });

      return users.map(user => ({
        ...user.toObject(),
        daysUntilPermanentDeletion: user.daysUntilPermanentDeletion
      }));
    } catch (error) {
      console.error('Error getting users scheduled for deletion:', error);
      throw error;
    }
  }

  // Restore a soft-deleted user
  async restoreUser(userId) {
    try {
      const user = await User.findOne({ _id: userId, isDeleted: true });
      
      if (!user) {
        throw new Error('User not found or not deleted');
      }

      await user.restore();
      return user;
    } catch (error) {
      console.error('Error restoring user:', error);
      throw error;
    }
  }

  // Log permanent deletions for audit purposes
  async logPermanentDeletions(userIds) {
    // You can implement logging to a separate collection here
    // For now, we'll just log to console
    console.log(`Logged permanent deletion of users: ${userIds.join(', ')}`);
    
    // Example: Save to an audit collection
    /*
    const AuditLog = mongoose.model('AuditLog');
    await AuditLog.create({
      action: 'PERMANENT_USER_DELETION',
      details: {
        userIds: userIds,
        deletionTime: new Date(),
        count: userIds.length
      },
      timestamp: new Date()
    });
    */
  }

  // Start the scheduled cleanup job (runs daily at 2 AM)
  startScheduledCleanup() {
    // Run every day at 2 AM
    cron.schedule('0 2 * * *', async () => {
      if (this.isRunning) {
        console.log('Cleanup job already running, skipping...');
        return;
      }

      this.isRunning = true;
      console.log('Starting scheduled user cleanup...');

      try {
        await this.permanentDeleteOldUsers();
        console.log('Scheduled user cleanup completed successfully');
      } catch (error) {
        console.error('Scheduled user cleanup failed:', error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log('User cleanup service started - will run daily at 2 AM');
  }

  // Manual trigger for cleanup (for testing or admin use)
  async manualCleanup() {
    console.log('Manual cleanup triggered');
    return await this.permanentDeleteOldUsers();
  }
}

export default new UserCleanupService();