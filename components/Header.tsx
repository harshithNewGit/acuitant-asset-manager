
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-[#221F20] shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                        <img src="/logo.png" alt="Acutant Assetz Logo" className="h-8 w-auto" />
                        <span className="text-xl font-semibold text-white">Acutant Assetz</span>
                    </div>
                    <nav className="flex items-center space-x-4">
                        <a href="#" className="px-3 py-2 text-sm font-medium text-white bg-[#DA3832] rounded-md hover:bg-red-700 transition-colors">
                            Assets
                        </a>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
