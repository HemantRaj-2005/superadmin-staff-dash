// components/PostDetailModal.js - Updated with Comments Tab
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Trash2, 
  Image as ImageIcon, 
  Heart, 
  User,
  Calendar,
  FileText,
  MessageCircle,
  Reply,
  MoreVertical,
  Flag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/services/api';

const PostDetailModal = ({ post, onClose, onRemoveReaction, onHardDelete }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [comments, setComments] = useState([]);
  const [commentStats, setCommentStats] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.log(error);
      return 'Invalid Date';
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return formatDate(dateString);
    } catch (error) {
      console.log(error);
      return 'Invalid Date';
    }
  };

  const getInitials = (user) => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  // Fetch comments when comments tab is active
  useEffect(() => {
    if (activeTab === 'comments' && post?._id) {
      fetchComments();
      fetchCommentStats();
    }
  }, [activeTab, post?._id]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await api.get(`/comments/posts/${post._id}/comments`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchCommentStats = async () => {
    try {
      const response = await api.get(`/comments/posts/${post._id}/stats`);
      setCommentStats(response.data);
    } catch (error) {
      console.error('Error fetching comment stats:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      // Refresh comments after deletion
      fetchComments();
      fetchCommentStats();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleSubmitReply = async (parentCommentId) => {
    if (!replyContent.trim()) return;

    try {
      // Note: In a real app, you'd have an API to create replies
      // For now, we'll just show a message
      console.log('Replying to comment:', parentCommentId, 'with content:', replyContent);
      
      // Reset reply state
      setReplyingTo(null);
      setReplyContent('');
      
      // Refresh comments to show the new reply
      fetchComments();
      fetchCommentStats();
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  // Recursive component for nested comments
  const CommentTree = ({ comment, level = 0 }) => {
    const isRootLevel = level === 0;
    const marginLeft = level * 24; // 24px indentation per level

    return (
      <div className={`${!isRootLevel ? 'border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
        <Card 
          className={`mb-4 dark:bg-gray-800 dark:border-gray-700 ${!isRootLevel ? 'ml-4' : ''}`}
          style={{ marginLeft: !isRootLevel ? `${marginLeft}px` : '0' }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="text-xs dark:bg-gray-600 dark:text-gray-200">
                    {getInitials({ firstName: 'User', lastName: comment.userId?.slice(-2) })}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      User {comment.userId?.slice(-6)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  </div>

                  {/* Reply Input */}
                  {replyingTo === comment._id && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        placeholder="Write your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[80px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(comment._id)}
                          disabled={!replyContent.trim()}
                        >
                          Post Reply
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                          className="dark:border-gray-600 dark:text-gray-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Comment
                  </DropdownMenuItem>
                  <DropdownMenuItem className="dark:text-gray-300 dark:focus:bg-gray-700">
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Recursively render replies */}
        {comment.replies && comment.replies.map(reply => (
          <CommentTree 
            key={reply._id} 
            comment={reply} 
            level={level + 1}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Post Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage post information
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1">
              <TabsTrigger 
                value="details" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <FileText className="h-4 w-4" />
                <span>Details</span>
              </TabsTrigger>
              <TabsTrigger 
                value="comments" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Comments</span>
                {commentStats && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {commentStats.totalComments}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="reactions" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <Heart className="h-4 w-4" />
                <span>Reactions</span>
              </TabsTrigger>
              <TabsTrigger 
                value="images" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Images</span>
              </TabsTrigger>
            </TabsList>

            {/* Details Tab - Keep existing content */}
            <TabsContent value="details" className="space-y-6">
              {/* Existing details content remains the same */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Post Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {post.title || 'Untitled Post'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mt-1">
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {post.content || 'No content'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ... rest of details tab content ... */}
            </TabsContent>

            {/* New Comments Tab */}
            <TabsContent value="comments" className="space-y-6">
              {/* Comment Statistics */}
              {commentStats && (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Comment Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {commentStats.totalComments}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          Total Comments
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {commentStats.topLevelComments}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                          Top Level
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {commentStats.replies}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                          Replies
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comments List */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Comments ({comments.length})
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchComments}
                      disabled={loadingComments}
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingComments ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">Loading comments...</p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Be the first to comment on this post
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map(comment => (
                        <CommentTree key={comment._id} comment={comment} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add Comment Section */}
              {/* <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Add Comment
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Add a new comment to this post (Admin perspective)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Write your comment..."
                      className="min-h-[100px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        Clear
                      </Button>
                      <Button>
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </TabsContent>

            {/* Reactions Tab - Keep existing content */}
            <TabsContent value="reactions" className="space-y-6">
              {/* Existing reactions content remains the same */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Reactions ({post.reactions?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!post.reactions || post.reactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No reactions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {post.reactions?.map((reaction) => (
                        <div key={reaction._id} className="flex items-center justify-between p-3 border dark:border-gray-600 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{reaction.emoji}</span>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{reaction.label}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">By: {reaction.reactedBy}</p>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-white">Remove Reaction</AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-gray-400">
                                  Are you sure you want to remove this {reaction.label} reaction from the post?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onRemoveReaction(post._id, reaction._id)}
                                  className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                                >
                                  Remove Reaction
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab - Keep existing content */}
            <TabsContent value="images" className="space-y-6">
              {/* Existing images content remains the same */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Images ({post.imageUrl?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!post.imageUrl || post.imageUrl.length === 0 ? (
                    <div className="text-center py-8">
                      <ImageIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No images in this post</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {post.imageUrl.map((url, index) => (
                        <div key={index} className="border dark:border-gray-600 rounded-lg overflow-hidden group relative">
                          <img
                            src={url}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.png';
                              e.target.alt = 'Image not available';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="dark:text-white">Remove Image</AlertDialogTitle>
                                  <AlertDialogDescription className="dark:text-gray-400">
                                    Are you sure you want to remove this image from the post? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {/* Add remove image functionality here */}}
                                    className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                                  >
                                    Remove Image
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Danger Zone */}
          <Separator className="my-6" />
          
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-sm text-red-900 dark:text-red-300 flex items-center">
                <Trash2 className="h-4 w-4 mr-2" />
                Warning!
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-400">
                Once you delete this post, there is no going back. Please be certain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="dark:bg-red-600 dark:hover:bg-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post Permanently
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                      This action cannot be undone. This will permanently delete the post
                      "{post.title || 'Untitled Post'}" and remove all associated data including
                      reactions, comments, and images from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onHardDelete(post._id)}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                    >
                      Delete Post
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;