import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct, clearProductError, setProductPage, pushProductToken } from '../features/products/productSlice';
import { fetchCategories } from '../features/categories/categorySlice';
import Button from '../components/common/Button';
import { Plus, Edit2, Trash2, Search, Package, Eye } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import { useNavigate } from 'react-router-dom';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, isLoading, error, nextPageToken, tokenHistory, currentPage, pageSize } = useSelector((state) => state.products);
  const { items: categories } = useSelector((state) => state.categories);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ pageSize }));
    if (categories.length === 0) {
      dispatch(fetchCategories({ pageSize: 100 }));
    }
  }, [dispatch, pageSize]);

  const handleNextPage = () => {
    if (nextPageToken) {
      dispatch(pushProductToken(nextPageToken));
      dispatch(setProductPage(currentPage + 1));
      dispatch(fetchProducts({ pageSize, pageToken: nextPageToken }));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevToken = tokenHistory[currentPage - 2];
      dispatch(setProductPage(currentPage - 1));
      dispatch(fetchProducts({ pageSize, pageToken: prevToken }));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : <span className="text-gray-400 italic">Unknown</span>;
  };

  const columns = [
    {
      key: 'srNo',
      label: 'Sr No',
      className: 'w-16',
      render: (_, index) => (currentPage - 1) * pageSize + index + 1
    },
    {
      key: 'thumbnail',
      label: 'Image',
      className: 'w-20',
      render: (row) => (
        <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-100">
          {row.thumbnail ? (
            <img src={row.thumbnail} alt={row.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              <Package className="h-6 w-6" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Product Name',
      className: 'min-w-[200px]',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-400">{row.subcategory}</div>
        </div>
      )
    },
    {
      key: 'categoryId',
      label: 'Category',
      render: (row) => getCategoryName(row.categoryId)
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => (
        <span className="font-semibold text-gray-900">
          ₹{Number(row.price).toLocaleString()}
        </span>
      )
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${row.stock > 10 ? 'bg-green-500' : row.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`}></span>
          <span className={row.stock === 0 ? 'text-red-600 font-medium' : ''}>
            {row.stock} unit{row.stock !== 1 ? 's' : ''}
          </span>
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
            onClick={() => navigate(`/products/view/${row.id}`)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(`/products/edit/${row.id}`)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Manage your store inventory and pricing</p>
        </div>
        <Button onClick={() => navigate('/products/add')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            Displaying {filteredProducts.length} products
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredProducts}
          isLoading={isLoading}
          emptyMessage="No products found"
          pagination={{
            onNext: handleNextPage,
            onPrev: handlePrevPage,
            hasNext: !!nextPageToken,
            hasPrev: currentPage > 1,
            currentPage: currentPage
          }}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
