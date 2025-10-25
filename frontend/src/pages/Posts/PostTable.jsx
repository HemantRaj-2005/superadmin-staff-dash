import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Trash2, Heart, Image as ImageIcon } from 'lucide-react';

const PostTable = ({ posts, loading, onPostClick, onDeletePost }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-muted-foreground space-y-2">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-300" />
            <p className="text-lg font-medium">No posts found</p>
            <p className="text-sm">There are no posts to display at the moment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (author) => {
    if (!author) return 'U';
    return `${author.firstName?.[0] || ''}${author.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const handleDeleteClick = (e, postId) => {
    e.stopPropagation();
  };

  return (
    <Card>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[350px]">Post</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Reactions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow 
                key={post._id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onPostClick(post)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    {post.imageUrl && post.imageUrl.length > 0 ? (
                      <div className="flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-lg object-cover border"
                          src={post.imageUrl[0]}
                          alt="Post thumbnail"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="h-12 w-12 rounded-lg border bg-muted flex items-center justify-center hidden">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-lg border bg-muted flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm line-clamp-1">
                        {post.title || 'Untitled Post'}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {post.content || 'No content'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={post.authorDetails?.profileImage} 
                        alt={`${post.authorDetails?.firstName} ${post.authorDetails?.lastName}`}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(post.authorDetails)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {post.authorDetails?.firstName} {post.authorDetails?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {post.authorDetails?.email || post.author}
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">
                      {post.reactions?.length || 0}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {post.reactions?.length || 0} reactions
                    </Badge>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                </TableCell>
                
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(e, post._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this post? This action cannot be undone 
                          and the post will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeletePost(post._id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Post
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default PostTable;