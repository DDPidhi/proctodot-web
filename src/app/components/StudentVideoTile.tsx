'use client';

import React, { useEffect, useRef } from 'react';

interface StudentVideoTileProps {
  name: string;
  stream?: MediaStream;
  onSendToEnd?: () => void;
  onStartExam?: () => void;
  isCompleted?: boolean;
  onCompletedAction?: () => void;
  isFullView?: boolean;
}

const StudentVideoTile: React.FC<StudentVideoTileProps> = ({ 
  name, 
  stream, 
  onSendToEnd,
  onStartExam,
  isCompleted = false,
  onCompletedAction,
  isFullView = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`p-1 ${isFullView ? 'h-full' : 'aspect-square'}`}>
      <div className={`relative bg-black rounded-2xl overflow-hidden group border-4 ${isCompleted ? 'border-green-500' : 'border-white hover:border-blue-100'} ${isFullView ? 'h-full' : 'aspect-square'}`}>
        {stream ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <span className="text-white">Connecting...</span>
          </div>
        )}
        
        {isCompleted && (
          <div className="absolute top-0 left-0 right-0 bg-green-600 text-white p-2 text-center text-sm font-medium">
            Exam Completed
          </div>
        )}
        
        <div className="absolute right-0 left-0 bottom-0 text-white p-1 text-xs bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex justify-between items-center">
            <span className="font-medium">{name}</span>
            <div className="flex gap-2">
              {!isCompleted && onStartExam && isFullView && (
                <button
                  onClick={onStartExam}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs text-white transition-colors"
                >
                  Start Exam
                </button>
              )}
              {isCompleted && onCompletedAction && isFullView && (
                <button
                  onClick={onCompletedAction}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs text-white transition-colors"
                >
                  Submit Exam Session
                </button>
              )}
              {onSendToEnd && (
                <button
                  onClick={onSendToEnd}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs"
                >
                  Send to end
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentVideoTile;