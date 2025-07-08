import React from 'react';

const DialogWrapper = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full animate-fadeIn relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-light"
          aria-label="Close dialog"
        >
          &times;
        </button>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-center text-gray-800">{title}</h2>
        </div>
        <div className="max-h-[60vh] overflow-y-auto space-y-2 text-gray-700 px-2">
          {children}
        </div>
      </div>

      {/* Optional: fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DialogWrapper;
