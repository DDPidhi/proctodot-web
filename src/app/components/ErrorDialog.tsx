import React from 'react';

interface ErrorDialogProps {
    title: string;
    message: string;
    buttonText: string;
    visible: boolean;
    onClose: () => void;
    onAction?: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
                                                     title,
                                                     message,
                                                     buttonText,
                                                     visible,
                                                     onClose,
                                                     onAction,
                                                 }) => {
    if (!visible) return null;

    const handleButtonClick = () => {
        if (onAction) {
            onAction();
        }
        onClose();
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative w-full max-w-lg bg-white p-6 rounded-lg shadow-lg border border-[#27616e] text-center">
              <button
                onClick={onClose}
                className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                  &times;
              </button>
              <div className="flex flex-col items-center">
                  <h2 className="text-2xl font-semibold text-[#27616e] mt-4 mb-2">{title}</h2>
                  <p className="text-gray-600 text-base mt-2">{message}</p>
                  <button
                    onClick={handleButtonClick}
                    className="mt-10 px-6 py-3 bg-[#27616e] text-white text-base rounded-lg hover:bg-[#20464f] transition"
                  >
                      {buttonText}
                  </button>
              </div>
          </div>
      </div>
    );
};

export default ErrorDialog;
