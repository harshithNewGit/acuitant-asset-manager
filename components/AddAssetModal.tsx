import React, { useState, FormEvent } from 'react';
import type { Asset, Category } from '../types';
import { STATUSES } from '../constants';
import { XMarkIcon } from './icons/XMarkIcon';

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddAsset: (asset: Omit<Asset, 'id' | 'category'>) => void;
    categories: Category[];
}

const initialFormState: Omit<Asset, 'id' | 'category'> = {
    asset_code: '',
    asset_name: '',
    quantity: 1,
    status: 'In Storage',
    model: '',
    fa_ledger: '',
    date_of_purchase: '',
    cost_of_asset: 0,
    useful_life: '',
    number_marked: '',
    assigned_to: '',
    location: '',
    closing_stock_rs: 0,
    remarks: '',
    category_id: undefined,
};

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onAddAsset, categories }) => {
    const [formData, setFormData] = useState<Omit<Asset, 'id' | 'category'>>(initialFormState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['quantity', 'cost_of_asset', 'closing_stock_rs', 'category_id'].includes(name);
        setFormData(prev => ({
            ...prev,
            [name]: isNumeric ? (value ? parseFloat(value) : undefined) : value,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            category_id: formData.category_id || (categories.length > 0 ? categories[0].id : undefined),
        };
        onAddAsset(dataToSubmit);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">Add New Asset</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="asset_name" className="block text-sm font-medium text-gray-700">Asset Name</label>
                                <input type="text" name="asset_name" id="asset_name" value={formData.asset_name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="asset_code" className="block text-sm font-medium text-gray-700">Asset Code</label>
                                <input type="text" name="asset_code" id="asset_code" value={formData.asset_code} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
                                <select id="category_id" name="category_id" value={formData.category_id || ''} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    <option value="" disabled>Select a category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    {STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                                <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="date_of_purchase" className="block text-sm font-medium text-gray-700">Date of Purchase</label>
                                <input type="date" name="date_of_purchase" id="date_of_purchase" value={formData.date_of_purchase} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="cost_of_asset" className="block text-sm font-medium text-gray-700">Cost of Asset</label>
                                <input type="number" name="cost_of_asset" id="cost_of_asset" value={formData.cost_of_asset} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} min="1" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">Assigned To</label>
                                <input type="text" name="assigned_to" id="assigned_to" value={formData.assigned_to} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                                <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                                <textarea name="remarks" id="remarks" value={formData.remarks} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Cancel
                            </button>
                            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Add Asset
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAssetModal;