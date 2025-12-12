import React, { useState, FormEvent, useEffect } from 'react';
import type { Asset, Category } from '../types';
import { STATUSES } from '../constants';
import { XMarkIcon } from './icons/XMarkIcon';

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddAsset: (asset: Omit<Asset, 'id' | 'category'>) => void;
    categories: Category[];
    initialIsSubscription?: boolean;
}

const initialFormState: Omit<Asset, 'id' | 'category'> = {
    asset_code: '',
    asset_name: '',
    quantity: undefined,
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
    is_subscription: false,
    subscription_vendor: '',
    subscription_renewal_date: '',
    subscription_billing_cycle: '',
    subscription_url: '',
};

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onAddAsset, categories, initialIsSubscription = false }) => {
    const [formData, setFormData] = useState<Omit<Asset, 'id' | 'category'>>(initialFormState);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                ...initialFormState,
                is_subscription: initialIsSubscription,
            });
        }
    }, [isOpen, initialIsSubscription]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked,
            }));
            return;
        }

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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {formData.is_subscription ? 'Add Subscription' : 'Add New Asset'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="asset_name" className="block text-sm font-medium text-gray-700">Asset Name</label>
                                <input type="text" name="asset_name" id="asset_name" value={formData.asset_name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="asset_code" className="block text-sm font-medium text-gray-700">Asset Code</label>
                                <input type="text" name="asset_code" id="asset_code" value={formData.asset_code} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
                                <select id="category_id" name="category_id" value={formData.category_id || ''} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm">
                                    <option value="" disabled>Select a category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm">
                                    {STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                                <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="fa_ledger" className="block text-sm font-medium text-gray-700">FA Ledger</label>
                                <input type="text" name="fa_ledger" id="fa_ledger" value={formData.fa_ledger} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="useful_life" className="block text-sm font-medium text-gray-700">Useful Life (e.g., 5 years)</label>
                                <input type="text" name="useful_life" id="useful_life" value={formData.useful_life} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="number_marked" className="block text-sm font-medium text-gray-700">Number Marked</label>
                                <input type="text" name="number_marked" id="number_marked" value={formData.number_marked} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="closing_stock_rs" className="block text-sm font-medium text-gray-700">Closing Stock (Rs)</label>
                                <input type="number" name="closing_stock_rs" id="closing_stock_rs" value={formData.closing_stock_rs} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="date_of_purchase" className="block text-sm font-medium text-gray-700">Date of Purchase</label>
                                <input type="date" name="date_of_purchase" id="date_of_purchase" value={formData.date_of_purchase} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="cost_of_asset" className="block text-sm font-medium text-gray-700">Cost of Asset</label>
                                <input type="number" name="cost_of_asset" id="cost_of_asset" value={formData.cost_of_asset} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    id="quantity"
                                    value={formData.quantity ?? ''}
                                    onChange={handleChange}
                                    min="0"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">Assigned To</label>
                                <input type="text" name="assigned_to" id="assigned_to" value={formData.assigned_to} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                                <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="is_subscription"
                                        name="is_subscription"
                                        type="checkbox"
                                        checked={!!formData.is_subscription}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-[#DA3832] border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <label htmlFor="is_subscription" className="text-sm font-medium text-gray-700">
                                        This asset is a subscription
                                    </label>
                                </div>
                            </div>
                            {formData.is_subscription && (
                                <>
                                    <div>
                                        <label htmlFor="subscription_vendor" className="block text-sm font-medium text-gray-700">Subscription Vendor</label>
                                        <input
                                            type="text"
                                            name="subscription_vendor"
                                            id="subscription_vendor"
                                            value={formData.subscription_vendor}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="subscription_billing_cycle" className="block text-sm font-medium text-gray-700">Billing Cycle</label>
                                        <input
                                            type="text"
                                            name="subscription_billing_cycle"
                                            id="subscription_billing_cycle"
                                            placeholder="Monthly, Annual, etc."
                                            value={formData.subscription_billing_cycle}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="subscription_renewal_date" className="block text-sm font-medium text-gray-700">Renewal Date</label>
                                        <input
                                            type="date"
                                            name="subscription_renewal_date"
                                            id="subscription_renewal_date"
                                            value={formData.subscription_renewal_date}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="subscription_url" className="block text-sm font-medium text-gray-700">Subscription URL</label>
                                        <input
                                            type="url"
                                            name="subscription_url"
                                            id="subscription_url"
                                            value={formData.subscription_url}
                                            onChange={handleChange}
                                            placeholder="Login or billing portal link"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                        />
                                    </div>
                                </>
                            )}
                            <div className="sm:col-span-2">
                                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                                <textarea name="remarks" id="remarks" value={formData.remarks} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"></textarea>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Cancel
                            </button>
                            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#DA3832] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                {formData.is_subscription ? 'Add Subscription' : 'Add Asset'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAssetModal;
