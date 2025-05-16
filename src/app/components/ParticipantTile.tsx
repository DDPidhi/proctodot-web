import React from "react";
import { Link } from 'lucide-react';
import ParticipantInfoBox from "@/app/components/ParticipantInfoBox";

interface ParticipantTileProps {
    name: string;
    videoUrl: string;
    onSendToEnd: () => void;
    isFullView?: boolean;
}

const ParticipantTile: React.FC<ParticipantTileProps> = ({name, videoUrl, onSendToEnd, isFullView = false}) => {
    return (
        <div className={`relative bg-gray-100 rounded-2xl shadow overflow-hidden hover:border-8 hover:border-blue-100 ${isFullView ? 'h-full' : ''}`}>
            <div className={`w-full ${isFullView ? 'aspect-auto h-full' : 'aspect-square'} bg-gray-300`}>
                <iframe
                    src={videoUrl}
                    title={name}
                    className="w-full h-full pointer-events-none"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    frameBorder="0"
                />
            </div>
            {!isFullView && (
                <>
                    <div className="absolute bottom-2 left-2 bg-white text-black px-2 py-1 text-sm rounded-2xl">
                        {name}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSendToEnd();
                        }}
                        className="w-8 h-8 p-2 items-center justify-center bg-white rounded-full absolute bottom-2 right-2 z-10"
                    >
                        <Link className="w-4 h-4" />
                    </button>
                </>
            )}
            {isFullView && (
                <ParticipantInfoBox
                    name={name}
                    message="IdCert ID here!"
                />
            )}
            {isFullView && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSendToEnd();
                        }}
                        className=" px-4 py-2 items-center justify-center bg-white rounded-full absolute top-10 right-10 z-10"
                    >
                        Refresh
                    </button>
                </>
            )}
        </div>
    );
};

export default ParticipantTile;
