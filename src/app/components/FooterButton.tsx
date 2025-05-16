'use client';
import React from 'react';

interface Props {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    pressed?: boolean;
}

const FooterButton: React.FC<Props> = ({ onClick, active = false, pressed = false, children }) => {
    const baseStyle = 'flex items-center gap-1 text-sm px-3 py-1 rounded-xl transition';
    const borderStyle = active || pressed
        ? 'border border-blue-200 bg-blue-100'
        : 'border border-transparent';

    const pressStyle = pressed ? 'transform active:scale-95' : '';

    return (
        <button onClick={onClick} className={`${baseStyle} ${borderStyle} ${pressStyle}`}>
            {children}
        </button>
    );
};

export default FooterButton;
