'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import FooterButton from '@/app/components/FooterButton';
import SettingsDropdown from '@/app/components/SettingsDropdown';
import DeviceSelectModal from "@/app/components/DeviceSelectModal";
import useMediaDevices from "@/hooks/useMediaDevices";

const Footer = () => {
    const { audioInputs, videoInputs } = useMediaDevices();
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [settingsModalType, setSettingsModalType] = useState<'audio' | 'video' | null>(null);

    const handleSettingsClick = () => {
        setShowSettingsMenu(prev => !prev);
        setSettingsModalType(null);
    };

    const openSettingsModal = (type: 'audio' | 'video') => {
        setSettingsModalType(type);
        setShowSettingsMenu(false);
    };

    return (
        <footer className="relative w-full px-6 py-3 border-t border-neutral-300 flex items-center justify-between bg-white text-gray-800 -mt-14 z-50">
            <div className="text-xl font-semibold text-[#27616e]">ProctoDot</div>

            <div className="hidden md:flex items-center gap-6">
                <div className="relative">
                    <FooterButton onClick={handleSettingsClick} active={showSettingsMenu || !!settingsModalType}>
                        <Settings size={14} /> Settings
                    </FooterButton>
                    {showSettingsMenu && <SettingsDropdown onSelect={openSettingsModal} />}
                </div>
            </div>

            {settingsModalType && (
                <DeviceSelectModal
                    type={settingsModalType}
                    devices={settingsModalType === 'audio' ? audioInputs : videoInputs}
                    onClose={() => setSettingsModalType(null)}
                />
            )}
        </footer>
    );
};

export default Footer;
