
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-[#221F20] shadow-md">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16">
                    <div className="flex items-center space-x-3">
                        <img src="/logo.png" alt="Acutant Assetz Logo" className="h-8 w-auto" />
                        <span className="text-xl font-semibold text-white">Acutant Assetz</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
