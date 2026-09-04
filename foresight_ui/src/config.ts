const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const wsProtocol = apiHost.startsWith('https') ? 'wss' : 'ws';
const hostPath = apiHost.replace(/^https?:\/\//, '');

export const API_BASE_URL = apiHost;
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || `${wsProtocol}://${hostPath}`;
