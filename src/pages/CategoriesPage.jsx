import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, deleteCategory, clearCategoryError, setPage, pushToken } from '../features/categories/categorySlice';
import Button from '../components/common/Button';
import { Plus, Edit2, Trash2, Search, Layers, Eye } from 'lucide-react';
import CategoryModal from '../components/categories/CategoryModal';
import DataTable from '../components/common/DataTable';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const { items: categories, isLoading, error, nextPageToken, tokenHistory, currentPage, pageSize } = useSelector((state) => state.categories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories({ pageSize }));
  }, [dispatch, pageSize]);

  const handleNextPage = () => {
    if (nextPageToken) {
      dispatch(pushToken(nextPageToken));
      dispatch(setPage(currentPage + 1));
      dispatch(fetchCategories({ pageSize, pageToken: nextPageToken }));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevToken = tokenHistory[currentPage - 2];
      dispatch(setPage(currentPage - 1));
      dispatch(fetchCategories({ pageSize, pageToken: prevToken }));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category? All subcategories will also be removed.')) {
      dispatch(deleteCategory(id));
    }
  };

  const handleEdit = (category) => {
    dispatch(clearCategoryError());
    setSelectedCategory(category);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleView = (category) => {
    dispatch(clearCategoryError());
    setSelectedCategory(category);
    setIsViewOnly(true);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    dispatch(clearCategoryError());
    setSelectedCategory(null);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'srNo',
      label: 'Sr No',
      className: 'w-20',
      render: (_, index) => (currentPage - 1) * pageSize + index + 1
    },
    {
      key: 'name',
      label: 'Category Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="bg-primary-50 p-2 rounded-lg text-primary-600">
            <Layers className="h-5 w-5" />
          </div>
          <span className="font-medium text-gray-900">{row.name}</span>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      cellClassName: 'text-gray-600 max-w-sm',
      render: (row) => (
        <div className="line-clamp-2" title={row.description}>
          {row.description || <span className="text-gray-300">No description</span>}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-2 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); handleView(row); }}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">Manage your product categories and subcategories</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            Displaying {filteredCategories.length} categories
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredCategories}
          isLoading={isLoading}
          emptyMessage="No categories found"
          pagination={{
            onNext: handleNextPage,
            onPrev: handlePrevPage,
            hasNext: !!nextPageToken,
            hasPrev: currentPage > 1,
            currentPage: currentPage
          }}
        />
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        isViewOnly={isViewOnly}
      />
    </div>
  );
};

export default CategoriesPage;
