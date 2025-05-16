'use client';

import React, { useState } from 'react';
import { WalletAccount } from '@/core/services/walletService';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (account: WalletAccount) => void;
  accounts: WalletAccount[];
  isConnecting: boolean;
  error: string | null;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  accounts,
  isConnecting,
  error
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Connect Wallet</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {isConnecting ? (
          <div className="text-center py-8">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Connecting to wallet...</p>
          </div>
        ) : accounts.length > 0 ? (
          <>
            <p className="mb-4 text-gray-600">Select an account to continue:</p>
            <div className="space-y-2 mb-6">
              {accounts.map((account) => (
                <label
                  key={account.address}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="account"
                    value={account.address}
                    checked={selectedAccount === account.address}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{account.meta.name || 'Unnamed Account'}</p>
                    <p className="text-sm text-gray-500 font-mono">
                      {account.address.slice(0, 8)}...{account.address.slice(-6)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const account = accounts.find(acc => acc.address === selectedAccount);
                  if (account) onConnect(account);
                }}
                disabled={!selectedAccount}
                className="px-4 py-2 bg-[#27616e] text-white rounded-lg hover:bg-[#1e4d59] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Connect
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Please install Polkadot{'{.js}'} extension and create an account.
            </p>
            <a
              href="https://polkadot.js.org/extension/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Get Polkadot{'{.js}'} Extension
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnectModal;