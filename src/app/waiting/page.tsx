'use client';
import ParticipantTile from "@/app/components/ParticipantTile";
import StudentVideoTile from "@/app/components/StudentVideoTile";
import React, { useState, useEffect, useRef }  from "react";
import Footer from "@/app/components/Footer";
import { ProctorSocketHandler, SocketMessage } from "@/core/services/socketHandler";
import { authUtils } from "@/core/services/authUtils";
import { useRouter } from "next/navigation";
import { Routes } from "@/constants/enums";
import { WebRTCHandler } from "@/core/services/webrtcHandler";

interface Participant {
    id: number;
    name: string;
    stream?: MediaStream;
    videoUrl?: string;
}

const initialParticipants: Participant[] = [];


const WaitingRoom: React.FC = () => {
    const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
    const [selectedParticipantIndex, setSelectedParticipantIndex] = useState<number | null>(null);
    const proctorVideoRef = useRef<HTMLVideoElement>(null);
    const [socketHandler, setSocketHandler] = useState<ProctorSocketHandler | null>(null);
    const [webRTCHandler, setWebRTCHandler] = useState<WebRTCHandler | null>(null);
    const router = useRouter();

    const handleTileClick = (index: number) => {
        setSelectedParticipantIndex(index);
    };

    const closeOverlay = () => {
        setSelectedParticipantIndex(null);
    };

    const sendToEnd = (index: number) => {
        setParticipants(prev => {
            const updated = [...prev];
            const [removed] = updated.splice(index, 1);
            updated.push(removed);
            return updated;
        });
    };

    // Initialize proctor's camera
    useEffect(() => {
        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: false 
                });
                
                if (proctorVideoRef.current) {
                    proctorVideoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
            }
        }

        setupCamera();

        // Cleanup on unmount
        return () => {
            if (proctorVideoRef.current && proctorVideoRef.current.srcObject) {
                const stream = proctorVideoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Initialize WebSocket connection for proctor
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:8080/api/ws/chat/proctor';
        
        // Get auth token and user data
        const token = authUtils.getAuthToken();
        const user = authUtils.getUser();
        
        if (!token || !user) {
            console.error('No auth token or user found');
            router.push(Routes.Login);
            return;
        }
        
        const proctorId = user.id || 1; // Use actual user ID
        
        console.log('Attempting Proctor WebSocket connection:', {
            url: socketUrl,
            proctorId,
            tokenPreview: token.substring(0, 20) + '...'
        });
        
        const handler = new ProctorSocketHandler(socketUrl, proctorId, token);
        setSocketHandler(handler);
        
        // Initialize WebRTC handler
        const rtcHandler = new WebRTCHandler();
        setWebRTCHandler(rtcHandler);
        
        // Initialize proctor's stream for WebRTC
        rtcHandler.initializeLocalStream().catch(console.error);
        
        // Set up event handlers for proctor-specific events
        handler.on('join-request', async (data: SocketMessage) => {
            console.log('Student join request:', data);
            // Extract student ID from sender_id field
            const studentId = parseInt((data as any).sender_id || data.participant);
            
            // Create peer connection for student
            const peerConnection = rtcHandler.createPeerConnection(studentId);
            
            // Set up handlers for WebRTC events
            rtcHandler.setupPeerConnectionHandlers(
                studentId,
                (event) => {
                    // Handle incoming student stream
                    console.log('Received student stream:', event);
                    if (event.streams && event.streams[0]) {
                        const newParticipant: Participant = {
                            id: studentId,
                            name: `Student ${studentId}`,
                            stream: event.streams[0]
                        };
                        setParticipants(prev => [...prev, newParticipant]);
                    }
                },
                (candidate) => {
                    // Send ICE candidate to student
                    handler.sendMessage({
                        event: 'ice-candidate',
                        message: JSON.stringify(candidate),
                        participant: studentId
                    });
                },
                (state) => {
                    console.log(`Connection state for student ${studentId}:`, state);
                }
            );
            
            // Create and send offer
            try {
                const offer = await rtcHandler.createOffer(studentId);
                handler.sendMessage({
                    event: 'webrtc-offer',
                    message: JSON.stringify(offer),
                    participant: studentId
                });
            } catch (error) {
                console.error('Error creating offer:', error);
            }
        });
        
        handler.on('webrtc-answer', async (data: SocketMessage) => {
            console.log('Received WebRTC answer:', data);
            const studentId = parseInt((data as any).sender_id || data.participant);
            const answer = JSON.parse(data.message);
            await rtcHandler.handleAnswer(studentId, answer);
        });
        
        handler.on('ice-candidate', async (data: SocketMessage) => {
            console.log('Received ICE candidate:', data);
            const studentId = parseInt((data as any).sender_id || data.participant);
            const candidate = JSON.parse(data.message);
            await rtcHandler.handleIceCandidate(studentId, candidate);
        });
        
        handler.on('student-left', (data: SocketMessage) => {
            console.log('Student left:', data);
            const studentId = data.participant;
            // Remove student from participants
            setParticipants(prev => prev.filter(p => p.id !== studentId));
            // Close peer connection
            rtcHandler.closePeerConnection(studentId);
        });
        
        // Connect to WebSocket
        handler.connect();
        
        // Cleanup on unmount
        return () => {
            handler.disconnect();
            rtcHandler.cleanup();
        };
    }, []);

    return (
        <>
            <div className="relative min-h-screen bg-white p-4">
                {selectedParticipantIndex !== null ? (
                    <div className="flex h-screen gap-4 rounded-2xl "
                         style={{height: "calc(100vh - 90px)"}}
                    >
                        <div className="w-1/2">
                            {participants[selectedParticipantIndex].stream ? (
                                <StudentVideoTile
                                    name={participants[selectedParticipantIndex].name}
                                    stream={participants[selectedParticipantIndex].stream}
                                    onSendToEnd={() => sendToEnd(selectedParticipantIndex)}
                                    isFullView
                                />
                            ) : (
                                <ParticipantTile
                                    name={participants[selectedParticipantIndex].name}
                                    videoUrl={participants[selectedParticipantIndex].videoUrl}
                                    onSendToEnd={() => sendToEnd(selectedParticipantIndex)}
                                    isFullView
                                />
                            )}
                        </div>

                        <div className="w-1/2 relative">
                            <div
                                className="absolute inset-0 bg-neutral-600/75 z-10 cursor-pointer rounded-2xl"
                                onClick={closeOverlay}
                            />

                            <div className="w-full grid grid-cols-3 sm:grid-cols-3 gap-2 relative z-0 p-2">
                                {participants.map((participant, index) => (
                                    index !== selectedParticipantIndex && (
                                        participant.stream ? (
                                            <StudentVideoTile
                                                key={index}
                                                name={participant.name}
                                                stream={participant.stream}
                                                onSendToEnd={() => sendToEnd(index)}
                                            />
                                        ) : (
                                            <ParticipantTile
                                                key={index}
                                                name={participant.name}
                                                videoUrl={participant.videoUrl}
                                                onSendToEnd={() => sendToEnd(index)}
                                            />
                                        )
                                    )
                                ))}
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-5 sm:grid-cols-4 gap-4">
                        {participants.map((participant, index) => (
                            <div onClick={() => handleTileClick(index)} key={index}>
                                {participant.stream ? (
                                    <StudentVideoTile
                                        name={participant.name}
                                        stream={participant.stream}
                                        onSendToEnd={() => sendToEnd(index)}
                                    />
                                ) : (
                                    <ParticipantTile
                                        name={participant.name}
                                        videoUrl={participant.videoUrl}
                                        onSendToEnd={() => sendToEnd(index)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className={"flex w-40 h-40 absolute bottom-20 right-5 rounded-full justify-center items-center border-8 border-white hover:border-blue-100 shadow-md overflow-hidden"}>
                    <video
                        ref={proctorVideoRef}
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                        autoPlay
                        muted
                        playsInline
                    />
                </div>
            </div>
            <Footer />
        </>

    );
}

export default WaitingRoom;
