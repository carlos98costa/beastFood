const trimTrailingSlashes = (value) => String(value || '').trim().replace(/\/+$/, '');

export const getApiBaseUrl = () => {
  const productionApiUrl = trimTrailingSlashes(process.env.REACT_APP_API_URL);

  if (process.env.NODE_ENV === 'production') {
    return productionApiUrl;
  }

  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol || 'http:';
    const hostname = window.location.hostname || 'localhost';
    return `${protocol}//${hostname}:5000`;
  }

  return 'http://localhost:5000';
};

export const resolveApiUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${getApiBaseUrl()}${normalized}`;
};
