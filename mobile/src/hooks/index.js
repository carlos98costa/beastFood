// Hooks de autenticação
export { default as useAuth } from './useAuth';

// Hooks de localização
export { default as useLocation } from './useLocation';

// Hooks de câmera
export { default as useCamera } from './useCamera';

// Re-exportar serviços relacionados para conveniência
export { default as locationService } from '../services/locationService';
export { default as cameraService } from '../services/cameraService';