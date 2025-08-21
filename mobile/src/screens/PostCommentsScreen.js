import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { postService, SERVER_BASE_URL } from '../utils/api';
import { normalizePosts, normalizeComments } from '../utils/normalizers';
import { PLACEHOLDERS, getSafeImageUri } from '../utils/placeholders';

const PostCommentsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params;
  const { user, token, isAuthenticated } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null); // { id, userName }

  useEffect(() => {
    loadPostAndComments();
  }, [postId]);

  const loadPostAndComments = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do post
      const postResponse = await postService.getPostById(postId);
      
      // Carregar comentários do post
      const commentsResponse = await postService.getPostComments(postId);

      const normalizedPostList = normalizePosts([postResponse]) || normalizePosts([postResponse.post]);
      const normalizedPost = Array.isArray(normalizedPostList) ? normalizedPostList[0] : null;
      setPost(normalizedPost || postResponse.post || postResponse);
      setComments(normalizeComments(commentsResponse.comments || []));
    } catch (error) {
      console.error('Erro ao carregar post e comentários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      return promptLogin();
    }
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      
      const response = await postService.addPostComment(postId, { content: newComment, parentCommentId: replyTarget?.id || null });

      // Adicionar o novo comentário à lista
      const normalizedNew = normalizeComments([response.comment])[0];
      if (replyTarget) {
        // Inserir dentro do bloco de respostas já expandido
        setExpandedReplies((prev) => {
          const state = prev[replyTarget.id] || { expanded: false, loaded: false, loading: false, replies: [] };
          const replies = [normalizedNew, ...(state.replies || [])];
          return {
            ...prev,
            [replyTarget.id]: { ...state, expanded: true, loaded: true, loading: false, replies },
          };
        });
        // Atualiza contador de respostas no comentário pai
        setComments((prev) => prev.map((c) => (String(c.id) === String(replyTarget.id) ? { ...c, replies_count: (c.replies_count || 0) + 1 } : c)));
      } else {
        setComments(prev => [normalizedNew, ...prev]);
      }
      setNewComment('');
      setReplyTarget(null);
      // Atualizar contador de comentários do post somente para comentários de nível superior
      if (!replyTarget && post) {
        setPost(prev => ({
          ...prev,
          comments_count: (prev?.comments_count || 0) + 1,
        }));
      }
      
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      Alert.alert('Erro', 'Não foi possível enviar o comentário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLikeComment = async (commentId, isReply = false, parentId = null) => {
    if (!isAuthenticated) {
      return promptLogin();
    }
    try {
      const resp = await postService.toggleCommentLike(commentId);
      const liked = Boolean(resp?.liked);
      if (!isReply) {
        setComments((prev) => prev.map((c) => (String(c.id) === String(commentId) ? { ...c, liked, likes_count: Math.max(0, (c.likes_count || 0) + (liked ? 1 : -1)) } : c)));
      } else if (parentId) {
        setExpandedReplies((prev) => {
          const state = prev[parentId];
          if (!state) return prev;
          const replies = (state.replies || []).map((r) => (String(r.id) === String(commentId) ? { ...r, liked, likes_count: Math.max(0, (r.likes_count || 0) + (liked ? 1 : -1)) } : r));
          return { ...prev, [parentId]: { ...state, replies } };
        });
      }
    } catch (e) {
      console.error('Erro ao curtir comentário:', e);
      Alert.alert('Erro', 'Não foi possível atualizar o like.');
    }
  };

  const startReply = (commentId, userName) => {
    setReplyTarget({ id: commentId, userName: userName || 'Usuário' });
  };

  const cancelReply = () => setReplyTarget(null);

  const handleDeleteComment = async (commentId) => {
    Alert.alert(
      'Excluir Comentário',
      'Tem certeza que deseja excluir este comentário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await postService.deletePostComment(commentId);
              
              // Remover comentário da lista
              setComments(prev => prev.filter(c => c.id !== commentId));
              
              // Atualizar contador
              if (post) {
                setPost(prev => ({
                  ...prev,
                  comments_count: Math.max(0, (prev.comments_count || 0) - 1)
                }));
              }
              
            } catch (error) {
              console.error('Erro ao excluir comentário:', error);
              Alert.alert('Erro', 'Não foi possível excluir o comentário');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Agora há pouco';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const openUserProfile = (targetUsername) => {
    if (!targetUsername) return;
    // Como Profile está dentro do TabNavigator (Main), navegamos para a rota aninhada
    navigation.navigate('Main', { screen: 'Profile', params: { username: targetUsername } });
  };

  const promptLogin = () => {
    Alert.alert(
      'Faça login',
      'Entre na sua conta para comentar e curtir comentários.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Entrar', onPress: () => navigation.navigate('Login') },
      ]
    );
  };

  const toggleReplies = async (commentId) => {
    const current = expandedReplies[commentId] || { expanded: false, loaded: false, loading: false, replies: [] };
    // Se já expandido, apenas alterna visibilidade
    if (current.loaded) {
      setExpandedReplies((prev) => ({
        ...prev,
        [commentId]: { ...current, expanded: !current.expanded },
      }));
      return;
    }

    // Carregar respostas na primeira expansão
    try {
      setExpandedReplies((prev) => ({
        ...prev,
        [commentId]: { ...current, expanded: true, loading: true },
      }));
      const resp = await postService.getCommentReplies(commentId);
      const replies = normalizeComments(resp.replies || []);
      setExpandedReplies((prev) => ({
        ...prev,
        [commentId]: { expanded: true, loaded: true, loading: false, replies },
      }));
    } catch (e) {
      console.error('Erro ao carregar respostas:', e);
      Alert.alert('Erro', 'Não foi possível carregar as respostas.');
      setExpandedReplies((prev) => ({
        ...prev,
        [commentId]: { ...current, expanded: false, loading: false },
      }));
    }
  };

  const renderComment = ({ item }) => {
    const state = expandedReplies[item.id] || { expanded: false, loaded: false, loading: false, replies: [] };
    return (
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            onPress={() => openUserProfile(item.user?.username)}
            activeOpacity={0.7}
          >
            <Image 
              source={{ uri: getSafeImageUri(item.user?.profile_picture, PLACEHOLDERS.USER_AVATAR) }}
              style={styles.commentAvatar}
            />
            <View style={styles.commentInfo}>
              <Text style={styles.commentAuthor}>{item.user?.name || 'Usuário'}</Text>
              <Text style={styles.commentDate}>{formatDate(item.created_at)}</Text>
            </View>
          </TouchableOpacity>
          
          {item.user?.id === user?.id && (
            <TouchableOpacity 
              onPress={() => handleDeleteComment(item.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.commentContent}>{item.content}</Text>

        {/* Ações do comentário */}
        <View style={styles.commentActionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleLikeComment(item.id)}>
            <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={16} color={item.liked ? '#ef4444' : '#475569'} />
            <Text style={styles.actionText}>{item.likes_count || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => startReply(item.id, item.user?.name)}>
            <Ionicons name="chatbubble-outline" size={16} color="#475569" />
            <Text style={styles.actionText}>Responder</Text>
          </TouchableOpacity>
        </View>

        {item.replies_count > 0 && (
          <TouchableOpacity style={styles.viewRepliesButton} onPress={() => toggleReplies(item.id)}>
            <Text style={styles.viewRepliesText}>
              {state.expanded ? 'Ocultar respostas' : `Ver mais (${item.replies_count}) respostas`}
            </Text>
          </TouchableOpacity>
        )}

        {state.expanded && (
          <View style={styles.repliesContainer}>
            {state.loading ? (
              <ActivityIndicator size="small" color="#ff6b6b" />
            ) : (
              (state.replies || []).map((reply) => (
                <View key={reply.id} style={styles.replyRow}>
                  <Image 
                    source={{ uri: getSafeImageUri(reply.user?.profile_picture, PLACEHOLDERS.USER_AVATAR) }}
                    style={styles.replyAvatar}
                  />
                  <View style={styles.replyBubble}>
                    <View style={styles.replyHeader}>
                      <Text style={styles.replyAuthor}>{reply.user?.name || 'Usuário'}</Text>
                      <Text style={styles.replyDate}>{formatDate(reply.created_at)}</Text>
                    </View>
                    <Text style={styles.replyContent}>{reply.content}</Text>
                    <View style={styles.replyActionsRow}>
                      <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleLikeComment(reply.id, true, item.id)}>
                        <Ionicons name={reply.liked ? 'heart' : 'heart-outline'} size={14} color={reply.liked ? '#ef4444' : '#475569'} />
                        <Text style={styles.actionText}>{reply.likes_count || 0}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton} onPress={() => startReply(item.id, reply.user?.name)}>
                        <Ionicons name="chatbubble-outline" size={14} color="#475569" />
                        <Text style={styles.actionText}>Responder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comentários</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Carregando comentários...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comentários</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Post Preview */}
          {post && (
            <View style={styles.postPreview}>
              <View style={styles.postHeader}>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => openUserProfile(post.user?.username)}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={{ uri: getSafeImageUri(post.user?.profile_picture, PLACEHOLDERS.USER_AVATAR) }}
                    style={styles.userAvatar}
                  />
                  <View>
                    <Text style={styles.userName}>{post.user?.name || 'Usuário'}</Text>
                    <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.postContent}>{post.content}</Text>
              
              {/* Renderizar imagem do post */}
               {((post.images && post.images.length > 0) || post.image_url) && (
                 <Image 
                   source={{ 
                     uri: post.images && post.images.length > 0 
                       ? (post.images[0].startsWith('http') ? post.images[0] : `${SERVER_BASE_URL}${post.images[0]}`)
                       : post.image_url
                       ? (post.image_url.startsWith('http') ? post.image_url : `${SERVER_BASE_URL}${post.image_url}`)
                       : null
                   }}
                   style={styles.postImage}
                   onError={(error) => console.log('Erro ao carregar imagem:', error)}
                 />
               )}
              
              <View style={styles.postStats}>
                <Text style={styles.statsText}>
                  {post.likes_count || 0} curtidas • {post.comments_count || 0} comentários
                </Text>
              </View>
            </View>
          )}

          {/* Comments List */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comentários ({comments.length})</Text>
            
            {comments.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubble-outline" size={48} color="#94a3b8" />
                <Text style={styles.emptyText}>Nenhum comentário ainda</Text>
                <Text style={styles.emptySubtext}>Seja o primeiro a comentar!</Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View key={comment.id}>
                  {renderComment({ item: comment })}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Barra de resposta (quando respondendo) */}
        {replyTarget && (
          <View style={styles.replyingBar}>
            <Text style={styles.replyingText}>Respondendo a {replyTarget.userName}</Text>
            <TouchableOpacity onPress={cancelReply} style={styles.cancelReplyBtn}>
              <Ionicons name="close" size={18} color="#475569" />
            </TouchableOpacity>
          </View>
        )}

        {/* Comment Input */}
        <View style={styles.commentInputContainer}>
          <Image 
            source={{ uri: getSafeImageUri(user?.profile_picture, PLACEHOLDERS.USER_AVATAR) }}
            style={styles.inputAvatar}
          />
          <TextInput
            style={styles.commentInput}
            placeholder="Escreva um comentário..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { opacity: newComment.trim() ? 1 : 0.5 }]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  postPreview: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8f9fa',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  postDate: {
    fontSize: 12,
    color: '#64748b',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postStats: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statsText: {
    fontSize: 12,
    color: '#64748b',
  },
  commentsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  commentCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  commentDate: {
    fontSize: 12,
    color: '#64748b',
  },
  deleteButton: {
    padding: 4,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginLeft: 42,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  viewRepliesButton: {
    marginLeft: 42,
    marginTop: 8,
  },
  viewRepliesText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 42,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
    paddingLeft: 10,
  },
  replyRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  replyAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
  },
  replyBubble: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  replyDate: {
    fontSize: 11,
    color: '#64748b',
  },
  replyContent: {
    fontSize: 13,
    color: '#374151',
  },
  commentActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 42,
    marginTop: 6,
    gap: 16,
  },
  replyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  replyingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  replyingText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  cancelReplyBtn: {
    padding: 4,
  },
});

export default PostCommentsScreen;