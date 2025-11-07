import React, { useState, useMemo, useEffect } from 'react';
import type { Asset, Category } from './types';
import { CATEGORIES } from './constants';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AssetTable from './components/AssetTable';
import AddAssetModal from './components/AddAssetModal';
import EditAssetModal from './components/EditAssetModal';
import ConfirmationModal from './components/ConfirmationModal';

const API_BASE_URL = 'http://localhost:3001'; // Your backend server URL

const App: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
    const [assetToDeleteId, setAssetToDeleteId] = useState<number | null>(null);
    const [isCategoryConfirmModalOpen, setIsCategoryConfirmModalOpen] = useState<boolean>(false);
    const [categoryToDeleteId, setCategoryToDeleteId] = useState<number | null>(null);

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


    const filteredAssets = useMemo(() => {
        return assets
            .filter(asset => {
                const categoryMatch = selectedCategory === 'All' || asset.category === selectedCategory;
                const searchMatch = searchTerm === '' ||
                    asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (asset.assigned_to && asset.assigned_to.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase()));
                return categoryMatch && searchMatch;
            });
    }, [assets, selectedCategory, searchTerm]);

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

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#221F20]">Assets Overview</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage and track all company assets from one place.</p>
                    </div>

                    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                        <div className="lg:col-span-3 xl:col-span-2">
                             <Sidebar
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onSelectCategory={setSelectedCategory}
                                onAddCategory={handleAddCategory}
                                onDeleteCategory={handleDeleteCategoryRequest}
                            />
                        </div>

                        <div className="mt-6 lg:mt-0 lg:col-span-9 xl:col-span-10">
                           <AssetTable
                                assets={filteredAssets}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                onAddAssetClick={() => setIsAddModalOpen(true)}
                                onSelectAsset={handleSelectAsset}
                                onDeleteRequest={handleDeleteRequest}
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
        </div>
    );
};

export default App;