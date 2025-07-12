import React, { useEffect, useState } from 'react';
import useTaskSocket from '../hooks/useTaskSocket';

export default function TaskLiveFeed() {
  const taskEvent = useTaskSocket();
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    if (taskEvent) {
      setFeed((prev) => [
        {
          type: taskEvent.type,
          task: taskEvent.task,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    }
  }, [taskEvent]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Live Activity Feed</h3>
        <span style={styles.count}>{feed.length} events</span>
      </div>
      
      {feed.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <p style={styles.emptyText}>No live events yet</p>
          <p style={styles.emptySubtext}>Task updates will appear here in real-time</p>
        </div>
      ) : (
        <div style={styles.feed}>
          {feed.map((event, idx) => (
            <div key={idx} style={styles.event}>
              <div style={styles.eventHeader}>
                <span style={styles.eventType}>
                  {event.type === 'created' ? '📝 Created' : '✏️ Updated'}
                </span>
                <span style={styles.eventTime}>{event.time}</span>
              </div>
              <div style={styles.eventContent}>
                <h4 style={styles.taskTitle}>{event.task.title}</h4>
                {event.task.status && (
                  <span style={styles.taskStatus}>
                    Status: {event.task.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e1e8ed',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e1e8ed',
    backgroundColor: '#f8f9fa'
  },
  title: {
    color: '#2c3e50',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0'
  },
  count: {
    color: '#7f8c8d',
    fontSize: '14px',
    backgroundColor: '#e1e8ed',
    padding: '4px 12px',
    borderRadius: '12px'
  },
  emptyState: {
    padding: '40px 24px',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  emptyText: {
    color: '#2c3e50',
    fontSize: '16px',
    fontWeight: '500',
    margin: '0 0 8px 0'
  },
  emptySubtext: {
    color: '#7f8c8d',
    fontSize: '14px',
    margin: '0'
  },
  feed: {
    maxHeight: '400px',
    overflowY: 'auto'
  },
  event: {
    padding: '16px 24px',
    borderBottom: '1px solid #e1e8ed',
    transition: 'background-color 0.2s ease'
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  eventType: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2c3e50'
  },
  eventTime: {
    fontSize: '12px',
    color: '#7f8c8d'
  },
  eventContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  taskTitle: {
    color: '#2c3e50',
    fontSize: '16px',
    fontWeight: '500',
    margin: '0'
  },
  taskStatus: {
    fontSize: '12px',
    color: '#7f8c8d',
    backgroundColor: '#f8f9fa',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-block'
  }
}; 