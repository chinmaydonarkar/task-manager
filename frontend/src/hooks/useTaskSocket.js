import { useEffect, useState } from 'react';
import socket from '../socket';

export default function useTaskSocket() {
  const [taskEvent, setTaskEvent] = useState(null);

  useEffect(() => {
    function onTaskCreated(task) {
      setTaskEvent({ type: 'created', task });
    }
    function onTaskUpdated(task) {
      setTaskEvent({ type: 'updated', task });
    }
    socket.on('taskCreated', onTaskCreated);
    socket.on('taskUpdated', onTaskUpdated);
    return () => {
      socket.off('taskCreated', onTaskCreated);
      socket.off('taskUpdated', onTaskUpdated);
    };
  }, []);

  return taskEvent;
} 