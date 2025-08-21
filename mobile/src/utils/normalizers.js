import { SERVER_BASE_URL } from './api';

function absolutizeUrl(possibleUrl) {
  if (!possibleUrl || typeof possibleUrl !== 'string') return null;
  return possibleUrl.startsWith('http') ? possibleUrl : `${SERVER_BASE_URL}${possibleUrl}`;
}

export function normalizePosts(apiPosts = []) {
  return (apiPosts || []).map((p) => {
    const images = Array.isArray(p.photos)
      ? p.photos
          .map((ph) => {
            if (typeof ph === 'string') return absolutizeUrl(ph);
            if (typeof ph?.photo_url === 'string') return absolutizeUrl(ph.photo_url);
            return null;
          })
          .filter(Boolean)
      : [];

    return {
      id: String(p.id),
      content: p.content || '',
      rating: typeof p.rating === 'number' ? p.rating : Number(p.rating) || 0,
      created_at: p.created_at,
      likes_count: Number(p.likes_count) || 0,
      comments_count: Number(p.comments_count) || 0,
      liked: Boolean(p.user_liked),
      user: {
        id: String(p.user_id),
        username: p.username,
        name: p.user_name || p.name || 'Usuário',
        profile_picture: absolutizeUrl(p.profile_picture) || null,
      },
      restaurant: p.restaurant_name
        ? {
            id: String(p.restaurant_id),
            name: p.restaurant_name,
            address: p.address || null,
            image_url: absolutizeUrl(p.restaurant_image_url),
          }
        : null,
      images,
      // Preservar fotos originais para edição
      photos: Array.isArray(p.photos) ? p.photos : [],
    };
  });
}

export function normalizeComments(apiComments = []) {
  return (apiComments || []).map((c) => ({
    id: String(c.id),
    content: c.content || '',
    created_at: c.created_at,
    likes_count: Number(c.likes_count) || 0,
    replies_count: Number(c.replies_count) || 0,
    liked: Boolean(c.user_liked),
    user: {
      id: String(c.user_id),
      username: c.username,
      name: c.user_name || c.name || 'Usuário',
      profile_picture: absolutizeUrl(c.profile_picture) || null,
    },
    // para evitar refetch desnecessário ao expandir
    _has_replies: Number(c.replies_count) > 0,
  }));
}


