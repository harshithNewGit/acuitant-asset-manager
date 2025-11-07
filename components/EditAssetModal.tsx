import React, { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import type { Asset, Category } from '../types';
import { STATUSES } from '../constants';
import { XMarkIcon } from './icons/XMarkIcon';
import { TrashIcon } from './icons/TrashIcon';

interface EditAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    assetToEdit: Asset | null;
    onUpdateAsset: (asset: Asset) => void;
    onDeleteRequest: (assetId: number) => void;
    categories: Category[];
}

const EditAssetModal: React.FC<EditAssetModalProps> = ({ isOpen, onClose, assetToEdit, onUpdateAsset, onDeleteRequest, categories }) => {
    const [formData, setFormData] = useState<Asset | null>(null);

    useEffect(() => {
        if (assetToEdit) {
            setFormData(assetToEdit);
        }
    }, [assetToEdit]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        const isNumeric = ['quantity', 'cost_of_asset', 'closing_stock_rs', 'category_id'].includes(name);
        setFormData(prev => ({
            ...prev!,
            [name]: isNumeric ? (value ? parseFloat(value) : undefined) : value,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (formData) {
            onUpdateAsset(formData);
        }
    };
    
    const handleDelete = () => {
        if (formData) {
            onDeleteRequest(formData.id);
        }
    }
    
    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">Edit Asset</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="asset_name" className="block text-sm font-medium text-gray-700">Asset Name</label>
                                <input type="text" name="asset_name" id="asset_name" value={formData.asset_name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="asset_code" className="block text-sm font-medium text-gray-700">Asset Code</label>
                                <input type="text" name="asset_code" id="asset_code" value={formData.asset_code} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
                                <select id="category_id" name="category_id" value={formData.category_id || ''} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md">
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md">
                                    {STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                                <input type="text" name="model" id="model" value={formData.model || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="fa_ledger" className="block text-sm font-medium text-gray-700">FA Ledger</label>
                                <input type="text" name="fa_ledger" id="fa_ledger" value={formData.fa_ledger || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="useful_life" className="block text-sm font-medium text-gray-700">Useful Life (e.g., 5 years)</label>
                                <input type="text" name="useful_life" id="useful_life" value={formData.useful_life || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="number_marked" className="block text-sm font-medium text-gray-700">Number Marked</label>
                                <input type="text" name="number_marked" id="number_marked" value={formData.number_marked || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="closing_stock_rs" className="block text-sm font-medium text-gray-700">Closing Stock (Rs)</label>
                                <input type="number" name="closing_stock_rs" id="closing_stock_rs" value={formData.closing_stock_rs || 0} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="date_of_purchase" className="block text-sm font-medium text-gray-700">Date of Purchase</label>
                                <input type="date" name="date_of_purchase" id="date_of_purchase" value={formData.date_of_purchase ? new Date(formData.date_of_purchase).toISOString().split('T')[0] : ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="cost_of_asset" className="block text-sm font-medium text-gray-700">Cost of Asset</label>
                                <input type="number" name="cost_of_asset" id="cost_of_asset" value={formData.cost_of_asset || 0} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} min="1" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">Assigned To</label>
                                <input type="text" name="assigned_to" id="assigned_to" value={formData.assigned_to || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                                <input type="text" name="location" id="location" value={formData.location || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                                <textarea name="remarks" id="remarks" value={formData.remarks || ''} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"></textarea>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-800"
                            >
                                <TrashIcon className="h-5 w-5 mr-2" />
                                Delete Asset
                            </button>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                    Cancel
                                </button>
                                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#DA3832] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditAssetModal;