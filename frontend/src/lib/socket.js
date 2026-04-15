import { io } from 'socket.io-client';
import { API_URL } from './api';

// Create a single shared socket instance
const socket = io(API_URL);

export default socket;
