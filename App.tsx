import React, { useState, useMemo, useEffect } from 'react';
import type { Asset, Category, AssetSortConfig, AssetSortKey } from './types';
import { CATEGORIES } from './constants';
import { API_BASE_URL } from './config';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AssetTable from './components/AssetTable';
import AddAssetModal from './components/AddAssetModal';
import EditAssetModal from './components/EditAssetModal';
import ConfirmationModal from './components/ConfirmationModal';
import DashboardOverview from './components/DashboardOverview';
import TodoList from './components/TodoList';

type DashboardFilterKey = 'all' | 'in_use' | 'in_storage' | 'for_repair';

const App: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<AssetSortConfig | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
    const [assetToDeleteId, setAssetToDeleteId] = useState<number | null>(null);
    const [isCategoryConfirmModalOpen, setIsCategoryConfirmModalOpen] = useState<boolean>(false);
    const [categoryToDeleteId, setCategoryToDeleteId] = useState<number | null>(null);
    const [dashboardFilter, setDashboardFilter] = useState<DashboardFilterKey>('all');
    const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

    const fetchData = async () => {
        try {
            const [assetsRes, categoriesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/assets`), // Corrected path
                fetch(`${API_BASE_URL}/categories`) // Corrected path
            ]);
            const assetsData = await assetsRes.json();
            const categoriesData: Category[] = await categoriesRes.json();
            setAssets(assetsData);
            // Ensure 'All' is always the first category and doesn't get duplicated
            setCategories(categoriesData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY || document.documentElement.scrollTop;
            setShowScrollTop(y > 200);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const filteredAssets = useMemo(() => {
        const statusFilter =
            dashboardFilter === 'in_use' ? 'in use' :
            dashboardFilter === 'in_storage' ? 'in storage' :
            dashboardFilter === 'for_repair' ? 'for repair' :
            null;

        return assets.filter(asset => {
            const categoryMatch = selectedCategory === 'All' || asset.category === selectedCategory;
            const searchMatch = searchTerm === '' ||
                asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (asset.assigned_to && asset.assigned_to.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase()));
            const statusMatch = !statusFilter ||
                (asset.status && asset.status.toLowerCase().trim() === statusFilter);
            return categoryMatch && searchMatch && statusMatch;
        });
    }, [assets, selectedCategory, searchTerm, dashboardFilter]);

    const sortedAssets = useMemo(() => {
        if (!sortConfig) {
            return filteredAssets;
        }

        const sorted = [...filteredAssets];
        sorted.sort((a, b) => {
            const { key, direction } = sortConfig;
            const directionMultiplier = direction === 'asc' ? 1 : -1;
            const aValue = a[key];
            const bValue = b[key];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return (aValue - bValue) * directionMultiplier;
            }

            const aText = (aValue ?? '').toString().toLowerCase();
            const bText = (bValue ?? '').toString().toLowerCase();

            if (aText < bText) return -1 * directionMultiplier;
            if (aText > bText) return 1 * directionMultiplier;
            return 0;
        });

        return sorted;
    }, [filteredAssets, sortConfig]);

    const handleAddCategory = async (newCategory: Omit<Category, 'id'>) => {
        if (newCategory.name && !categories.find(c => c.name.toLowerCase() === newCategory.name.toLowerCase())) {
            try {
                const response = await fetch(`${API_BASE_URL}/categories`, { // Corrected path
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newCategory),
                });
                if (response.ok) {
                    await fetchData(); // Refetch to get the latest state
                }
            } catch (error) {
                console.error("Failed to add category:", error);
            }
        }
    };

    const handleDeleteCategoryRequest = (categoryId: number) => {
        setCategoryToDeleteId(categoryId);
        setIsCategoryConfirmModalOpen(true);
    };

    const handleConfirmDeleteCategory = async () => {
        if (!categoryToDeleteId) return;
        try {
            const response = await fetch(`${API_BASE_URL}/categories/${categoryToDeleteId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setSelectedCategory('All'); // Reset to 'All' as the deleted category might have been selected
                await fetchData(); // Refetch to get the latest state
            }
        } catch (error) {
            console.error("Failed to delete category:", error);
        }

        setIsCategoryConfirmModalOpen(false);
        setCategoryToDeleteId(null);
    };


    const handleAddAsset = async (assetData: Omit<Asset, 'id' | 'category'> & { category_id: number }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/assets`, { // Corrected path
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assetData),
            });
            if (response.ok) {
                await fetchData(); // Refetch to get the latest state
                setIsAddModalOpen(false);
                // The form state in AddAssetModal will reset when it re-opens because it's keyed to its open/closed state.
            }
        } catch (error) {
            console.error("Failed to add asset:", error);
        }
    };

    const handleSelectAsset = (asset: Asset) => {
        setAssetToEdit(asset);
        setIsEditModalOpen(true);
    };

    const handleUpdateAsset = async (updatedAsset: Asset) => {
        try {
            const response = await fetch(`${API_BASE_URL}/assets/${updatedAsset.id}`, { // Corrected path
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedAsset),
            });
            if (response.ok) {
                await fetchData(); // Refetch to get the latest state
                setIsEditModalOpen(false);
                setAssetToEdit(null);
            }
        } catch (error) {
            console.error("Failed to update asset:", error);
        }
    };

    const handleDeleteRequest = (assetId: number) => {
        setAssetToDeleteId(assetId);
        setIsConfirmModalOpen(true);
        // If the edit modal is open for the asset being deleted, close it.
        if (assetToEdit?.id === assetId) {
            setIsEditModalOpen(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!assetToDeleteId) return;
        try {
            const response = await fetch(`${API_BASE_URL}/assets/${assetToDeleteId}`, { // Corrected path
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchData(); // Refetch to get the latest state
            }
        } catch (error) {
            console.error("Failed to delete asset:", error);
        }

        setIsConfirmModalOpen(false);
        setAssetToDeleteId(null);
    };

    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setAssetToDeleteId(null);
    };

    const handleSort = (key: AssetSortKey) => {
        setSortConfig(prev => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="w-full">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#221F20]">Assets Overview</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage and track all company assets from one place.</p>
                    </div>

                    <div className="lg:grid lg:grid-cols-12 lg:gap-8 mt-6">
                        <div className="lg:col-span-3 xl:col-span-2">
                             <Sidebar
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onSelectCategory={setSelectedCategory}
                                onAddCategory={handleAddCategory}
                                onDeleteCategory={handleDeleteCategoryRequest}
                            />
                        </div>

                        <div className="mt-6 lg:mt-0 lg:col-span-9 xl:col-span-10 space-y-6">
                           <div className="grid gap-6 lg:grid-cols-2">
                               <DashboardOverview
                                   assets={assets}
                                   categories={categories}
                                   activeFilter={dashboardFilter}
                                   onFilterChange={(filter) => {
                                       setDashboardFilter(prev =>
                                           prev === filter ? 'all' : filter
                                       );
                                   }}
                               />
                               <TodoList />
                           </div>
                           <AssetTable
                                assets={sortedAssets}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                onAddAssetClick={() => setIsAddModalOpen(true)}
                                onSelectAsset={handleSelectAsset}
                                onDeleteRequest={handleDeleteRequest}
                                sortConfig={sortConfig}
                                onSort={handleSort}
                           />
                        </div>
                    </div>
                </div>
            </main>
            <AddAssetModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddAsset={handleAddAsset}
                categories={categories}
            />
            <EditAssetModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                assetToEdit={assetToEdit}
                onUpdateAsset={handleUpdateAsset}
                onDeleteRequest={handleDeleteRequest}
                categories={categories}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Asset"
                message="Are you sure you want to delete this asset? This action cannot be undone."
            />
            <ConfirmationModal
                isOpen={isCategoryConfirmModalOpen}
                onClose={() => setIsCategoryConfirmModalOpen(false)}
                onConfirm={handleConfirmDeleteCategory}
                title="Delete Category"
                message="Are you sure you want to delete this category? All assets in this category will have their category unset. This action cannot be undone."
            />

            {showScrollTop && (
                <button
                    type="button"
                    onClick={handleScrollToTop}
                    className="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center h-11 w-11 rounded-full bg-[#221F20] text-white shadow-lg hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    aria-label="Scroll to top"
                >
                    <span className="text-lg leading-none">↑</span>
                </button>
            )}
        </div>
    );
};

export default App;
