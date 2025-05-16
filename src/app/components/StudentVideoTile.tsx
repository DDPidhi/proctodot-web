'use client';

import React, { useEffect, useRef } from 'react';

interface StudentVideoTileProps {
  name: string;
  stream?: MediaStream;
  onSendToEnd?: () => void;
  isFullView?: boolean;
}

const StudentVideoTile: React.FC<StudentVideoTileProps> = ({ 
  name, 
  stream, 
  onSendToEnd, 
  isFullView = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`p-1 ${isFullView ? 'h-full' : 'h-30'}`}>
      <div className={`relative bg-black rounded-2xl overflow-hidden group border-4 border-white hover:border-blue-100 ${isFullView ? 'h-full' : 'h-24'}`}>
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
        
        <div className="absolute right-0 left-0 bottom-0 text-white p-1 text-xs bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex justify-between items-center">
            <span className="font-medium">{name}</span>
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
  );
};

export default StudentVideoTile;