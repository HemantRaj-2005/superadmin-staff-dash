import React, { useState } from 'react';
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
import { 
  X, 
  Trash2, 
  Image as ImageIcon, 
  Heart, 
  User,
  Calendar,
  FileText
} from 'lucide-react';

const PostDetailModal = ({ post, onClose, onRemoveReaction, onHardDelete }) => {
  const [activeTab, setActiveTab] = useState('details');

  // Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getInitials = (author) => {
    if (!author) return 'U';
    return `${author.firstName?.[0] || ''}${author.lastName?.[0] || ''}`.toUpperCase() || 'U';
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
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1">
              <TabsTrigger 
                value="details" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700"
              >
                <FileText className="h-4 w-4" />
                <span>Details</span>
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

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
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

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Author Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={post.authorDetails?.profileImage} 
                        alt={`${post.authorDetails?.firstName} ${post.authorDetails?.lastName}`}
                      />
                      <AvatarFallback className="dark:bg-gray-600 dark:text-gray-200">
                        {getInitials(post.authorDetails)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {post.authorDetails?.firstName} {post.authorDetails?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {post.authorDetails?.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Post Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(post.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Updated</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(post.updatedAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reactions</label>
                      <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                        {post.reactions?.length || 0} reactions
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Images</label>
                      <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                        {post.imageUrl?.length || 0} images
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reactions Tab */}
            <TabsContent value="reactions" className="space-y-6">
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

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
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
                Danger Zone
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
                      reactions and images from our servers.
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