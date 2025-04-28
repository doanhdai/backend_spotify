import React from 'react';

const MetaChat = ({ onClose }) => {
    return (
        <div className="fixed top-0 right-0 w-96 h-full bg-[#181818] text-white shadow-lg flex flex-col">
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b border-gray-700">
                <h3 className="text-lg font-semibold">Meta AI</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    ✕
                </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-gray-400">Xin chào! Tôi là Meta AI. Bạn cần giúp gì?</p>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-700">
                <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    className="w-full p-2 bg-gray-800 rounded-md text-white outline-none"
                />
            </div>
        </div>
    );
};

export default MetaChat;
