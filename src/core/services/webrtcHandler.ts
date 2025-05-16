export interface RTCPeerConfig {
  iceServers: RTCIceServer[];
}

export class WebRTCHandler {
  private peerConnections: Map<number, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private config: RTCPeerConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor() {}

  // Initialize local stream (proctor's camera)
  public async initializeLocalStream(video: boolean = true, audio: boolean = true): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  // Create peer connection for a student
  public createPeerConnection(studentId: number): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection(this.config);

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    this.peerConnections.set(studentId, peerConnection);
    return peerConnection;
  }

  // Create offer for student
  public async createOffer(studentId: number): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(studentId);
    if (!peerConnection) {
      throw new Error('Peer connection not found for student: ' + studentId);
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  // Handle answer from student
  public async handleAnswer(studentId: number, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(studentId);
    if (!peerConnection) {
      throw new Error('Peer connection not found for student: ' + studentId);
    }

    await peerConnection.setRemoteDescription(answer);
  }

  // Handle ICE candidate from student
  public async handleIceCandidate(studentId: number, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.peerConnections.get(studentId);
    if (!peerConnection) {
      throw new Error('Peer connection not found for student: ' + studentId);
    }

    await peerConnection.addIceCandidate(candidate);
  }

  // Set up event handlers for a peer connection
  public setupPeerConnectionHandlers(
    studentId: number,
    onTrack: (event: RTCTrackEvent) => void,
    onIceCandidate: (candidate: RTCIceCandidate) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void
  ): void {
    const peerConnection = this.peerConnections.get(studentId);
    if (!peerConnection) return;

    peerConnection.ontrack = onTrack;
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };
    peerConnection.onconnectionstatechange = () => {
      onConnectionStateChange(peerConnection.connectionState);
    };
  }

  // Close peer connection
  public closePeerConnection(studentId: number): void {
    const peerConnection = this.peerConnections.get(studentId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(studentId);
    }
  }

  // Get local stream
  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Clean up all connections
  public cleanup(): void {
    this.peerConnections.forEach((connection, studentId) => {
      this.closePeerConnection(studentId);
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}