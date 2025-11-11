// components/PostDetailModal.js - Updated without Reply Functionality
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
  MoreVertical,
  Flag,
  Edit2,
  Mail,
  Copy,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/services/api';

const PostDetailModal = ({ post, onClose, onRemoveReaction, onHardDelete, onEdit }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [comments, setComments] = useState([]);
  const [commentStats, setCommentStats] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(String(text ?? ''));
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.log(error);
      return '—';
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

  const getPostInitials = (title) => {
    return title
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'PO';
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
    <TooltipProvider>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
        {/* Slide-over panel */}
        <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background shadow-xl border-l animate-in slide-in-from-right-0 duration-300">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background border-b">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {getPostInitials(post.title)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold truncate">
                      {post.title || 'Post Details'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="default" className="text-xs">
                        {post.status || 'Active'}
                      </Badge>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onEdit && (
                    <Button 
                      onClick={() => onEdit(post)}
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile Edit Button */}
              {onEdit && (
                <div className="sm:hidden mt-3">
                  <Button 
                    onClick={() => onEdit(post)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Post
                  </Button>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details" className="flex items-center gap-2 text-xs">
                    <FileText className="h-4 w-4" />
                    <span>Details</span>
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="flex items-center gap-2 text-xs">
                    <MessageCircle className="h-4 w-4" />
                    <span>Comments</span>
                    {commentStats && (
                      <Badge variant="secondary" className="h-4 px-1 text-xs">
                        {commentStats.totalComments}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="reactions" className="flex items-center gap-2 text-xs">
                    <Heart className="h-4 w-4" />
                    <span>Reactions</span>
                  </TabsTrigger>
                  <TabsTrigger value="images" className="flex items-center gap-2 text-xs">
                    <ImageIcon className="h-4 w-4" />
                    <span>Images</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Scrollable Content - SINGLE ScrollArea */}
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Post Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4" />
                        Post Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Title</p>
                          <p className="font-semibold">{post.title || 'Untitled Post'}</p>
                        </div>
                        <Badge variant="outline">Title</Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Content</p>
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="whitespace-pre-wrap break-words">
                            {post.content || 'No content available'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Author Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4" />
                        Author Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Author</p>
                          <p className="font-semibold">
                            {post.author?.firstName && post.author?.lastName 
                              ? `${post.author.firstName} ${post.author.lastName}`
                              : 'Unknown Author'
                            }
                          </p>
                        </div>
                        <Badge variant="outline">Author</Badge>
                      </div>
                      
                      {post.author?.email && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Email</p>
                              <p className="text-sm text-muted-foreground">{post.author.email}</p>
                            </div>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(post.author.email, 'authorEmail')}
                              >
                                {copiedField === 'authorEmail' ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy Email</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="h-4 w-4" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p className="font-semibold">{formatDate(post.createdAt)}</p>
                        </div>
                        <Badge variant="secondary">Created</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Last Updated</p>
                          <p className="font-semibold">{formatDate(post.updatedAt)}</p>
                        </div>
                        <Badge variant="secondary">Updated</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-6">
                  {/* Comment Statistics */}
                  {commentStats && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <MessageCircle className="h-4 w-4" />
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
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Comments ({comments.length})
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchComments}
                          disabled={loadingComments}
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
                            This post has no comments
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
                </div>
              )}

              {/* Reactions Tab */}
              {activeTab === 'reactions' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Heart className="h-4 w-4" />
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
                          <div key={reaction._id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{reaction.emoji}</span>
                              <div>
                                <p className="font-medium">{reaction.label}</p>
                                <p className="text-sm text-muted-foreground">By: {reaction.reactedBy}</p>
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
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Reaction</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove this {reaction.label} reaction from the post?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onRemoveReaction(post._id, reaction._id)}
                                    className="bg-red-600 hover:bg-red-700"
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
              )}

              {/* Images Tab */}
              {activeTab === 'images' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ImageIcon className="h-4 w-4" />
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {post.imageUrl.map((url, index) => (
                          <div key={index} className="border rounded-lg overflow-hidden group relative">
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
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Image</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove this image from the post? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {/* Add remove image functionality here */}}
                                      className="bg-red-600 hover:bg-red-700"
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
              )}

              {/* Danger Zone */}
              <Separator />
              
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                <CardHeader className="pb-3">
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
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the post
                          "{post.title || 'Untitled Post'}" and remove all associated data including
                          reactions, comments, and images from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onHardDelete(post._id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Post
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PostDetailModal;