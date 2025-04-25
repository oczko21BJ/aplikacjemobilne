import React, { useState, useEffect  } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share, 
  MapPin,
  Send
} from 'lucide-react-native';
import { api } from '@/services/api'; 

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}
const [post, setPost] = useState<any>(null);
const [loading, setLoading] = useState(true);

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(24);
  

  // Sample post data
  const post = {
    id: id as string,
    author: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    content: 'Beautiful sunset from Riverside Park today! 🌅 Perfect evening for a community walk. The weather was absolutely gorgeous and there were so many families out enjoying the park.',
    image: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    timestamp: '2 hours ago',
    location: 'Riverside Park',
  };

  const [comments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Mike Chen',
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'Amazing photo! I was there earlier too. The sunset was incredible.',
      timestamp: '1 hour ago'
    },
    {
      id: '2',
      author: 'Emma Davis',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'Thanks for sharing! Makes me want to visit the park more often.',
      timestamp: '45 minutes ago'
    },
    {
      id: '3',
      author: 'John Smith',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'Great shot! The colors are beautiful. What time was this taken?',
      timestamp: '30 minutes ago'
    }
  ]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      // Here you would typically send the comment to your API
      setNewComment('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Post */}
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <Image source={{ uri: post.avatar }} style={styles.avatar} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.author}</Text>
              <View style={styles.locationRow}>
                <MapPin size={12} color="#64748B" />
                <Text style={styles.location}>{post.location}</Text>
                <Text style={styles.timestamp}>• {post.timestamp}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          {post.image && (
            <Image source={{ uri: post.image }} style={styles.postImage} />
          )}

          <View style={styles.postActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLike}
            >
              <Heart 
                size={20} 
                color={isLiked ? '#EC4899' : '#64748B'}
                fill={isLiked ? '#EC4899' : 'transparent'}
              />
              <Text style={[
                styles.actionText,
                isLiked && { color: '#EC4899' }
              ]}>
                {likesCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={20} color="#64748B" />
              <Text style={styles.actionText}>{comments.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share size={20} color="#64748B" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Comments ({comments.length})
          </Text>

          {comments.map(comment => (
            <View key={comment.id} style={styles.commentItem}>
              <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.author}</Text>
                  <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                </View>
                <Text style={styles.commentText}>{comment.content}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          placeholderTextColor="#64748B"
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            newComment.trim() && styles.sendButtonActive
          ]}
          onPress={handleSendComment}
          disabled={!newComment.trim()}
        >
          <Send 
            size={20} 
            color={newComment.trim() ? '#FFFFFF' : '#94A3B8'} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  commentsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#64748B',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#2563EB',
  },
});