import React, { useState } from 'react';
import type { Category } from '../types';
import { PlusIcon } from './icons/PlusIcon';

interface SidebarProps {
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    onAddCategory: (category: Omit<Category, 'id'>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategory, onSelectCategory, onAddCategory }) => {
    const [newCategory, setNewCategory] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            onAddCategory({ name: newCategory.trim() });
            setNewCategory('');
        }
    };

    return (
        <aside className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
            <ul className="space-y-2">
                {categories.map(category => (
                    <li key={category.id}>
                        <button
                            onClick={() => onSelectCategory(category.name)}
                            className={`w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                selectedCategory === category.name
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            {category.name}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-gray-200">
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Add new category"
                        className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        aria-label="New category name"
                    />
                    <button
                        type="submit"
                        className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                        disabled={!newCategory.trim()}
                        aria-label="Add category"
                    >
                        <PlusIcon className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </aside>
    );
};

export default Sidebar;