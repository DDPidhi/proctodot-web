'use client';
import React, {useEffect, useState, useRef} from "react";
import {useRouter} from "next/navigation";
import { MemberSocketHandler, SocketMessage } from "@/core/services/socketHandler";
import { authUtils } from "@/core/services/authUtils";
import {Routes} from "@/constants/enums";
import { WebRTCHandler } from "@/core/services/webrtcHandler";

const questions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: 2,
  },
  {
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
    answer: 2,
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: ["Oxygen", "Gold", "Iron", "Zinc"],
    answer: 0,
  },
  {
    question: "Who wrote the play 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Leo Tolstoy"],
    answer: 1,
  },
  {
    question: "What year did World War II end?",
    options: ["1939", "1942", "1945", "1950"],
    answer: 2,
  },
  {
    question: "Which continent is the Sahara Desert located in?",
    options: ["Asia", "South America", "Africa", "Australia"],
    answer: 2,
  },
  {
    question: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    answer: 2,
  },
  {
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
    answer: 1,
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Mercury"],
    answer: 1,
  },
  {
    question: "What is the longest river in the world?",
    options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
    answer: 1,
  },
];

const Questionnaire: React.FC = () => {
  const router = useRouter();

  const [current, setCurrent] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(Array(questions.length).fill(null));
  const [isFinished, setIsFinished] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [socketHandler, setSocketHandler] = useState<MemberSocketHandler | null>(null);
  const [webRTCHandler, setWebRTCHandler] = useState<WebRTCHandler | null>(null);
  const proctorVideoRef = useRef<HTMLVideoElement>(null);
  const [proctorStream, setProctorStream] = useState<MediaStream | null>(null);

  const score = selectedAnswers.filter((ans, i) => ans === questions[i].answer).length;

  const handleOptionChange = (index: number) => {
    const updated = [...selectedAnswers];
    updated[current] = index;
    setSelectedAnswers(updated);
  };

  const handleNext = () => {
    if (current === questions.length - 1) {
      setIsFinished(true);
      // Send exam completion message
      if (socketHandler) {
        const user = authUtils.getUser();
        const participantId = user?.id || 1;
        
        socketHandler.sendMessage({
          event: 'exam-completed',
          message: JSON.stringify({ score, answers: selectedAnswers }),
          participant: participantId
        });
      }
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  // Function to be called when proctor approves the student to start the exam
  const startExam = () => {
    setExamStarted(true);
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:8080/api/ws/chat/member';
    
    // Get auth token and user data using auth utility
    const token = authUtils.getAuthToken();
    const user = authUtils.getUser();
    
    if (!token || !user) {
      console.error('No auth token or user found');
      router.push(Routes.Login);
      return;
    }
    
    const participantId = user.id || 1; // Use actual user ID
    
    console.log('Attempting WebSocket connection:', {
      url: socketUrl,
      participantId,
      tokenPreview: token.substring(0, 20) + '...'
    });
    
    const handler = new MemberSocketHandler(socketUrl, participantId, token);
    setSocketHandler(handler);
    
    // Initialize WebRTC handler
    const rtcHandler = new WebRTCHandler();
    setWebRTCHandler(rtcHandler);
    
    // Initialize student's stream for WebRTC
    rtcHandler.initializeLocalStream(true, false).catch(console.error);
    
    // Set up event handlers
    handler.on('start-exam', (data: SocketMessage) => {
      console.log('Exam start approved by proctor');
      startExam();
    });
    
    handler.on('exam-end', (data: SocketMessage) => {
      console.log('Exam ended by proctor');
      setIsFinished(true);
    });
    
    // Handle WebRTC offer from proctor
    handler.on('webrtc-offer', async (data: SocketMessage) => {
      console.log('Received WebRTC offer from proctor');
      const proctorId = data.participant || 0;
      const offer = JSON.parse(data.message);
      
      // Create peer connection
      const peerConnection = rtcHandler.createPeerConnection(proctorId);
      
      // Set up handlers
      rtcHandler.setupPeerConnectionHandlers(
        proctorId,
        (event) => {
          // Handle incoming proctor stream
          console.log('Received proctor stream:', event);
          if (event.streams && event.streams[0]) {
            setProctorStream(event.streams[0]);
            if (proctorVideoRef.current) {
              proctorVideoRef.current.srcObject = event.streams[0];
            }
          }
        },
        (candidate) => {
          // Send ICE candidate to proctor
          handler.sendMessage({
            event: 'ice-candidate',
            message: JSON.stringify(candidate),
            participant: participantId,
            sender_id: String(participantId)
          });
        },
        (state) => {
          console.log('Connection state:', state);
        }
      );
      
      // Set remote description and create answer
      try {
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        // Send answer back to proctor
        handler.sendMessage({
          event: 'webrtc-answer',
          message: JSON.stringify(answer),
          participant: participantId,
          sender_id: String(participantId)
        });
      } catch (error) {
        console.error('Error handling WebRTC offer:', error);
      }
    });
    
    // Handle ICE candidates from proctor
    handler.on('ice-candidate', async (data: SocketMessage) => {
      console.log('Received ICE candidate from proctor');
      const proctorId = data.participant;
      const candidate = JSON.parse(data.message);
      await rtcHandler.handleIceCandidate(proctorId, candidate);
    });
    
    // Connect to WebSocket
    handler.connect();
    
    // Cleanup on unmount
    return () => {
      handler.disconnect();
      rtcHandler.cleanup();
    };
  }, []);
  
  // Expose startExam function for external use (e.g., from proctor's interface)
  // In production, this would typically be triggered by a WebSocket event or API call
  if (typeof window !== 'undefined') {
    (window as any).startExam = startExam;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">

      {/* Top: Header */}
      <header className="bg-[#27616e] text-white py-4 px-6 shadow w-full flex items-center justify-center">
        <h1 className="text-xl font-bold">Exam</h1>
      </header>

      {/* Proctor Video Component */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <video
            ref={proctorVideoRef}
            className="w-80 h-60 bg-gray-900"
            autoPlay
            muted={false}
            playsInline
            controls={false}
          />
          <div className="p-2 bg-gray-800 text-white text-center text-sm">
            {proctorStream ? 'Proctor Live Stream' : 'Connecting to Proctor...'}
          </div>
        </div>
      </div>

      {/* Exam Start Overlay */}
      {!examStarted && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="flex items-center justify-center h-full">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4" style={{ marginRight: '168px' }}>
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Waiting for Proctor Approval</h2>
                <p className="text-gray-600 mb-6">
                  Please wait while the proctor reviews your setup. You will be able to start the exam once the proctor grants you permission.
                </p>
                <div className="flex justify-center">
                  <div className="animate-pulse flex space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              {socketHandler && socketHandler.isConnected() && (
                <p className="mt-4 text-sm text-green-600">
                  Connected to proctor
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isFinished ? (
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
          <h2 className="text-3xl font-extrabold mb-2">Congratulations!</h2>
          <p className="text-xl font-semibold mb-6">You've completed the questionnaire.</p>

          <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
            <p className="text-xl font-bold mb-2">Your Score: {Math.round((score / questions.length) * 100)}%</p>
            <p className="text-gray-700">
              Well done. Keep up the great work!
            </p>
          </div>
        </div>
      ) : (

        <main className="flex-1 flex">
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
            <p className="text-xl font-semibold mb-4">
              Question {current + 1}: {questions[current].question}
            </p>
            <div className="space-y-2">
              {questions[current].options.map((option, index) => (
                <label key={index} className="block">
                  <input
                    type="radio"
                    name={`question-${current}`}
                    value={index}
                    checked={selectedAnswers[current] === index}
                    onChange={() => handleOptionChange(index)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between w-full max-w-2xl mt-4">
            <button
              onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
              className="bg-[#27616e] text-white px-4 py-2 rounded-2xl disabled:opacity-50"
              disabled={current === 0}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="bg-[#27616e] text-white px-4 py-2 rounded-2xl disabled:opacity-50"
              disabled={selectedAnswers[current] === null}
            >
              {current === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
          </div>
        </main>
      )}

      {/* Bottom: Footer */}
      <footer
        className="w-full px-6 py-3 border-t border-neutral-300 flex items-center justify-center bg-white text-gray-800 z-50">
        <div className="text-xl font-semibold text-[#27616e]">ProctoDot</div>
      </footer>
    </div>

  )
}

export default Questionnaire;
