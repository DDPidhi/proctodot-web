'use client';
import React from 'react';

interface Props {
    type: 'audio' | 'video';
    devices: MediaDeviceInfo[];
    onClose: () => void;
}

const DeviceSelectModal: React.FC<Props> = ({ type, devices, onClose }) => {
    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 bg-white p-4 rounded-md shadow-md border border-neutral-300">
            <h2 className="text-sm font-semibold mb-2">
                Select {type === 'audio' ? 'Audio' : 'Video'} Source
            </h2>
            <select className="w-full mb-4 p-2 border border-neutral-300 rounded">
                {devices.map(device => (
                    <option key={device.deviceId}>{device.label || 'Unnamed Device'}</option>
                ))}
            </select>
            <button
                onClick={onClose}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
                Close
            </button>
        </div>
    );
};

export default DeviceSelectModal;
