import React, { useState, FormEvent } from 'react';
import type { Category } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddCategory: (category: Omit<Category, 'id'>) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onAddCategory }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onAddCategory({ name: name.trim(), description: description.trim() });
            setName('');
            setDescription('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">Add New Category</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div>
                            <label htmlFor="category_name" className="block text-sm font-medium text-gray-700">Category Name</label>
                            <input
                                type="text"
                                id="category_name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter category name"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="category_description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="category_description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter a short description (optional)"
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            ></textarea>
                        </div>
                        <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Cancel</button>
                            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#DA3832] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Add Category</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCategoryModal;
