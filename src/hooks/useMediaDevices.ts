import { useState, useEffect } from 'react';

export interface MediaDevice {
  deviceId: string;
  label: string;
}

export default function useMediaDevices() {
  const [audioInputs, setAudioInputs] = useState<MediaDevice[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDevice[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    async function getDevices() {
      try {
        // Request permissions first
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setHasPermission(true);
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const audioDevices = devices
          .filter(device => device.kind === 'audioinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`
          }));
        
        const videoDevices = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 5)}`
          }));
        
        setAudioInputs(audioDevices);
        setVideoInputs(videoDevices);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setHasPermission(false);
      }
    }

    getDevices();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, []);

  return { audioInputs, videoInputs, hasPermission };
}
