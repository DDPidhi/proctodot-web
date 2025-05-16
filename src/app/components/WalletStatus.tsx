'use client';

import React from 'react';
import { WalletAccount } from '@/core/services/walletService';

interface WalletStatusProps {
  wallet: WalletAccount | null;
  onConnect: () => void;
}

const WalletStatus: React.FC<WalletStatusProps> = ({ wallet, onConnect }) => {
  return (
    <div className="fixed top-4 left-4 z-50">
      {wallet ? (
        <div className="bg-white rounded-lg shadow-md p-3 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <div>
            <p className="text-sm font-medium text-gray-800">Connected Wallet</p>
            <p className="text-xs text-gray-500 font-mono">
              {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className="bg-[#27616e] text-white px-4 py-2 rounded-lg hover:bg-[#1e4d59] transition-colors shadow-md"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletStatus;