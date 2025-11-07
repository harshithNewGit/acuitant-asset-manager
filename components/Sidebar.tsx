import React, { useState } from 'react';
import type { Category } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import AddCategoryModal from './AddCategoryModal';
import { TrashIcon } from './icons/TrashIcon';

interface SidebarProps {
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    onAddCategory: (category: Omit<Category, 'id'>) => void;
    onDeleteCategory: (categoryId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategory, onSelectCategory, onAddCategory, onDeleteCategory }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <aside className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-[#221F20] mb-4">Categories</h2>
            <ul className="space-y-1">
                <li>
                    <button
                        onClick={() => onSelectCategory('All')}
                        className={`w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                            selectedCategory === 'All'
                                ? 'bg-[#DA3832] text-white shadow'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >All</button>
                </li>
                {categories.map(category => (
                    <li key={category.id}>
                        <div className="flex items-center justify-between group">
                            <button
                                onClick={() => onSelectCategory(category.name)}
                                className={`flex-grow text-left px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                                    selectedCategory === category.name
                                        ? 'bg-[#DA3832] text-white shadow'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                {category.name}
                            </button>
                            <button
                                onClick={() => onDeleteCategory(category.id)}
                                className="p-1 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                aria-label={`Delete category ${category.name}`}
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#DA3832] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Category
                </button>
            </div>
            <AddCategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddCategory={onAddCategory}
            />
        </aside>
    );
};

export default Sidebar;