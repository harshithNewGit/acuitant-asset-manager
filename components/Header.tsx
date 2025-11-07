
import React from 'react';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                        <BuildingOfficeIcon className="h-8 w-8 text-indigo-600" />
                        <span className="text-xl font-semibold text-gray-900">Acutant Assetz</span>
                    </div>
                    <nav className="flex items-center space-x-4">
                        <a href="#" className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
                            Assets
                        </a>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
