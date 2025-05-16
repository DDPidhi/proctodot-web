export interface SocketMessage {
  event: string;
  message: string;
  participant: number;
}

export class MemberSocketHandler {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private reconnectInterval: number = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private participantId: number;
  private messageHandlers: Map<string, (data: SocketMessage) => void> = new Map();

  constructor(socketUrl: string, participantId: number, token: string) {
    this.url = socketUrl;
    this.participantId = participantId;
    this.token = token;
  }

  public connect(): void {
    try {
      // Since browsers can't send headers, we'll pass the token as a query parameter
      // Your backend needs to be configured to accept this as an alternative to headers
      const separator = this.url.includes('?') ? '&' : '?';
      const urlWithToken = `${this.url}${separator}token=${encodeURIComponent(this.token)}`;
      this.ws = new WebSocket(urlWithToken);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.clearReconnectTimer();
      // Send join request immediately after connection
      this.sendJoinRequest();
    };

    this.ws.onmessage = (event) => {
      try {
        const data: SocketMessage = JSON.parse(event.data);
        console.log('Received message:', data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      console.error('WebSocket readyState:', this.ws?.readyState);
      console.error('WebSocket url:', this.ws?.url);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected');
      console.log('Close code:', event.code);
      console.log('Close reason:', event.reason);
      console.log('Was clean:', event.wasClean);
      this.scheduleReconnect();
    };
  }

  private handleMessage(data: SocketMessage): void {
    const handler = this.messageHandlers.get(data.event);
    if (handler) {
      handler(data);
    }
  }

  public on(event: string, handler: (data: SocketMessage) => void): void {
    this.messageHandlers.set(event, handler);
  }

  public off(event: string): void {
    this.messageHandlers.delete(event);
  }

  private sendJoinRequest(): void {
    this.sendMessage({
      event: 'join-request',
      message: '',
      participant: 0
    });
  }

  public sendMessage(message: SocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect();
    }, this.reconnectInterval);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  public disconnect(): void {
    this.clearReconnectTimer();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}