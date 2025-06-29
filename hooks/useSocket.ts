import { useEffect, useRef } from 'react';
import {io, Socket} from 'socket.io-client';

const socketUrl = 'https://code-meet-server.onrender.com';
console.log(socketUrl);

const useSocket = (collab: boolean): Socket | null => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (collab && !socketRef.current) {
      socketRef.current = io(socketUrl);

      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }

    return () => {
      if (socketRef.current) {
        // socketRef.current.disconnect();
        // socketRef.current = null;
      }
    };
  }, [collab]);

  return socketRef.current;
};

export default useSocket;