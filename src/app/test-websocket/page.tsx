'use client';
import React, { useState } from 'react';
import { authUtils } from '@/core/services/authUtils';
import { testWebSocketConnection } from '@/core/services/socketHandlerVariants';

const TestWebSocket: React.FC = () => {
  const [status, setStatus] = useState<string>('Not connected');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const testConnection = () => {
    const token = authUtils.getAuthToken();
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:8080/api/ws/chat/exam-1';
    
    if (!token) {
      addLog('No auth token found');
      return;
    }

    addLog(`Testing connection to: ${baseUrl}`);
    addLog(`Token: ${token.substring(0, 20)}...`);

    // Try direct connection first
    try {
      const ws = new WebSocket(`${baseUrl}?token=${token}`);
      
      ws.onopen = () => {
        addLog('Direct connection successful!');
        setStatus('Connected');
      };
      
      ws.onerror = (error) => {
        addLog(`Direct connection error: ${JSON.stringify(error)}`);
      };
      
      ws.onclose = (event) => {
        addLog(`Direct connection closed - Code: ${event.code}, Reason: ${event.reason}`);
        setStatus('Disconnected');
      };

      ws.onmessage = (event) => {
        addLog(`Message received: ${event.data}`);
      };

    } catch (error) {
      addLog(`Failed to create WebSocket: ${error}`);
    }

    // Test variants
    setTimeout(() => {
      testWebSocketConnection(baseUrl, token);
    }, 2000);
  };

  const testWithPostmanFormat = () => {
    const token = authUtils.getAuthToken();
    const baseUrl = 'ws://localhost:8080/api/ws/chat/proctor-room-1';
    
    if (!token) {
      addLog('No auth token found');
      return;
    }

    addLog(`Testing Postman-style connection to: ${baseUrl}`);
    
    try {
      // Try to match Postman's exact URL
      const ws = new WebSocket(`${baseUrl}?token=${token}`);
      
      ws.onopen = () => {
        addLog('Postman-style connection successful!');
        // Send join request
        ws.send(JSON.stringify({
          event: 'join-request',
          message: '',
          participant: 1
        }));
      };
      
      ws.onerror = (error) => {
        addLog(`Postman-style error: ${JSON.stringify(error)}`);
      };
      
      ws.onclose = (event) => {
        addLog(`Postman-style closed - Code: ${event.code}, Reason: ${event.reason}`);
      };

    } catch (error) {
      addLog(`Failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">WebSocket Connection Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Connection Status: {status}</h2>
          
          <div className="space-y-4">
            <button
              onClick={testConnection}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Connection
            </button>
            
            <button
              onClick={testWithPostmanFormat}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
            >
              Test Postman Format
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Logs</h2>
          <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestWebSocket;