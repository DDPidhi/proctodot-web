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
import { getProctorinkService } from "@/core/services/proctorinkContract";
import { WalletService, WalletAccount } from "@/core/services/walletService";
import WalletConnectModal from "@/app/components/WalletConnectModal";
import WalletStatus from "@/app/components/WalletStatus";
import { getUserDetails } from "@/core/services/userService";

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
    const [completedStudents, setCompletedStudents] = useState<number[]>([]);
    const [completedData, setCompletedData] = useState<Map<number, any>>(new Map());
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [walletAccounts, setWalletAccounts] = useState<WalletAccount[]>([]);
    const [connectedWallet, setConnectedWallet] = useState<WalletAccount | null>(null);
    const [isConnectingWallet, setIsConnectingWallet] = useState(false);
    const [walletError, setWalletError] = useState<string | null>(null);
    const router = useRouter();
    const walletService = WalletService.getInstance();

    const handleTileClick = (index: number) => {
        setSelectedParticipantIndex(index);
    };

    const closeOverlay = () => {
        setSelectedParticipantIndex(null);
    };

    const connectWallet = async () => {
        setIsConnectingWallet(true);
        setWalletError(null);
        
        try {
            const accounts = await walletService.connectWallet();
            setWalletAccounts(accounts);
            
            if (accounts.length === 1) {
                // If only one account, automatically select it
                handleWalletConnect(accounts[0]);
            } else {
                // Show modal to select account
                setShowWalletModal(true);
            }
        } catch (error) {
            setWalletError(error instanceof Error ? error.message : 'Failed to connect wallet');
            setShowWalletModal(true);
        } finally {
            setIsConnectingWallet(false);
        }
    };

    const handleWalletConnect = (account: WalletAccount) => {
        walletService.selectAccount(account.address);
        setConnectedWallet(account);
        setShowWalletModal(false);
        console.log('Wallet connected:', account.address);
    };

    const sendToEnd = (index: number) => {
        setParticipants(prev => {
            const updated = [...prev];
            const [removed] = updated.splice(index, 1);
            updated.push(removed);
            return updated;
        });
    };

    const startStudentExam = async (studentId: number) => {
        if (!socketHandler) return;
        
        console.log('Approving exam start for student:', studentId);
        
        try {
            // Check if wallet is connected
            if (!connectedWallet) {
                alert('Please connect your wallet first');
                await connectWallet();
                return;
            }
            
            const proctorAddress = connectedWallet.address;
            
            // Get proctorink service
            const contractAddress = process.env.NEXT_PUBLIC_PROCTORINK_CONTRACT_ADDRESS;
            if (contractAddress) {
                const proctorinkService = getProctorinkService(contractAddress);
                
                // Initialize the service
                await proctorinkService.initialize();
                
                // Fetch student details to get wallet address
                const studentDetails = await getUserDetails(studentId);
                const studentAddress = studentDetails.wallet_address;
                
                console.log('Student wallet address:', studentAddress);
                
                // Set the start time in the contract
                const startTime = Date.now();
                const tx = await proctorinkService.setStartTime(
                    studentAddress,
                    startTime,
                    proctorAddress
                );
                
                // Sign and submit with wallet
                const result = await tx.signAndSubmit(walletService.getSelectedAccount()!.address);
                
                console.log('Exam start time recorded on blockchain', result);
            }
        } catch (error) {
            console.error('Error recording start time on blockchain:', error);
        }
        
        // Still send the WebSocket message to start the exam
        socketHandler.sendMessage({
            event: 'start-exam',
            message: '',
            participant: studentId
        });
    };

    const handleCompletedAction = async (studentId: number) => {
        console.log('Submitting exam session to blockchain for student:', studentId);
        
        try {
            // Check if wallet is connected
            if (!connectedWallet) {
                alert('Please connect your wallet first');
                await connectWallet();
                return;
            }
            
            // Get the exam data from completed data map
            const examData = completedData.get(studentId);
            if (!examData) {
                console.error('No exam data found for student:', studentId);
                return;
            }
            
            const proctorAddress = connectedWallet.address;
            
            // Get proctorink service (you'll need to provide the contract address)
            const contractAddress = process.env.NEXT_PUBLIC_PROCTORINK_CONTRACT_ADDRESS;
            if (!contractAddress) {
                console.error('Proctorink contract address not configured');
                return;
            }
            
            const proctorinkService = getProctorinkService(contractAddress);
            
            // Initialize the service
            await proctorinkService.initialize();
            
            // Fetch student details to get wallet address
            const studentDetails = await getUserDetails(studentId);
            const studentAddress = studentDetails.wallet_address;
            
            console.log('Student wallet address:', studentAddress);
            
            // Set the end time for the exam
            const endTime = Date.now();
            const tx = await proctorinkService.setEndTime(
                studentAddress,
                endTime,
                proctorAddress
            );
            
            // Sign and submit with wallet
            const result = await tx.signAndSubmit(walletService.getSelectedAccount()!.address);
            
            console.log('Exam end time submitted to blockchain:', result);
            alert('Exam session successfully submitted to blockchain!');
            
            // TODO: Update UI to show submission status
        } catch (error) {
            console.error('Error submitting to blockchain:', error);
            alert('Failed to submit exam session to blockchain');
        }
    };

    // Check wallet connection on mount
    useEffect(() => {
        connectWallet();
    }, []);

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
                        setParticipants(prev => {
                            // Check if participant already exists
                            const exists = prev.some(p => p.id === studentId);
                            if (exists) {
                                // Update existing participant with new stream
                                return prev.map(p => p.id === studentId ? newParticipant : p);
                            }
                            // Add new participant if not exists
                            return [...prev, newParticipant];
                        });
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
        
        handler.on('exam-completed', (data: SocketMessage) => {
            console.log('Student completed exam:', data);
            const studentId = parseInt((data as any).sender_id || data.participant);
            
            // Parse the exam data from the message
            let examData;
            try {
                examData = JSON.parse(data.message);
            } catch (e) {
                examData = { score: 0, answers: [] };
            }
            
            // Store the exam data
            setCompletedData(prev => {
                const newMap = new Map(prev);
                newMap.set(studentId, examData);
                return newMap;
            });
            
            setCompletedStudents(prev => [...prev, studentId]);
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
            <WalletStatus wallet={connectedWallet} onConnect={connectWallet} />
            
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
                                    onStartExam={() => startStudentExam(participants[selectedParticipantIndex].id)}
                                    isCompleted={completedStudents.includes(participants[selectedParticipantIndex].id)}
                                    onCompletedAction={() => handleCompletedAction(participants[selectedParticipantIndex].id)}
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
                                                isCompleted={completedStudents.includes(participant.id)}
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
                                        isCompleted={completedStudents.includes(participant.id)}
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
            
            <WalletConnectModal
                isOpen={showWalletModal}
                onClose={() => setShowWalletModal(false)}
                onConnect={handleWalletConnect}
                accounts={walletAccounts}
                isConnecting={isConnectingWallet}
                error={walletError}
            />
        </>

    );
}

export default WaitingRoom;
