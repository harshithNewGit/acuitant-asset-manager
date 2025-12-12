import React, { useMemo } from 'react';
import type { Asset } from '../types';

interface SubscriptionManagerProps {
    assets: Asset[];
    onAddSubscriptionClick?: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ assets, onAddSubscriptionClick }) => {
    const subscriptions = useMemo(
        () => assets.filter(asset => asset.is_subscription),
        [assets]
    );

    const totalMonthlyEstimated = useMemo(() => {
        return subscriptions.reduce((sum, sub) => {
            const cost = sub.cost_of_asset ?? 0;
            const cycle = (sub.subscription_billing_cycle || '').toLowerCase();
            if (!cost) return sum;
            if (cycle.includes('year')) {
                return sum + cost / 12;
            }
            return sum + cost;
        }, 0);
    }, [subscriptions]);

    if (subscriptions.length === 0) {
        return (
            <section className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-1">Subscription Manager</h2>
                        <p className="text-sm text-gray-500">
                            Track SaaS, licenses, and other recurring tools as subscription assets.
                        </p>
                    </div>
                    {onAddSubscriptionClick && (
                        <button
                            type="button"
                            onClick={onAddSubscriptionClick}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-[#DA3832] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Add Subscription
                        </button>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-baseline justify-between mb-4 gap-4">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Subscription Manager</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {subscriptions.length} active subscription assets
                        {' · '}
                        approx ₹{totalMonthlyEstimated.toFixed(0)}/month
                    </p>
                </div>
                {onAddSubscriptionClick && (
                    <button
                        type="button"
                        onClick={onAddSubscriptionClick}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-[#DA3832] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Add Subscription
                    </button>
                )}
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide text-xs">
                                Name
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide text-xs">
                                Vendor
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide text-xs">
                                Owner
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide text-xs">
                                Renewal
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wide text-xs">
                                Billing
                            </th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wide text-xs">
                                Cost
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {subscriptions.map(sub => (
                            <tr key={sub.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-900">
                                    {sub.asset_name}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                    {sub.subscription_vendor || '—'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                    {sub.assigned_to || '—'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                    {sub.subscription_renewal_date
                                        ? new Date(sub.subscription_renewal_date).toLocaleDateString()
                                        : '—'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                    {sub.subscription_billing_cycle || '—'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-gray-900">
                                    {typeof sub.cost_of_asset === 'number'
                                        ? `₹${sub.cost_of_asset.toLocaleString('en-IN', {
                                              maximumFractionDigits: 0,
                                          })}`
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default SubscriptionManager;

