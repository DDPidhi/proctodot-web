'use client';
import React from 'react';

interface Props {
    onSelect: (type: 'audio' | 'video') => void;
}

const SettingsDropdown: React.FC<Props> = ({ onSelect }) => {
    return (
        <div className="absolute bottom-12 right-0 w-32 bg-white shadow-md rounded-md overflow-hidden border border-neutral-300">
            <button onClick={() => onSelect('audio')} className="w-full px-4 py-2 text-left hover:bg-gray-100">
                Audio
            </button>
            <button onClick={() => onSelect('video')} className="w-full px-4 py-2 text-left hover:bg-gray-100">
                Video
            </button>
        </div>
    );
};

export default SettingsDropdown;
