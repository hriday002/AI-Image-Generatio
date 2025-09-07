
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center p-6 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-gradient-text bg-[size:200%_auto]">
                AI Image Generator
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Bring your imagination to life with Gemini</p>
        </header>
    );
};

export default Header;
