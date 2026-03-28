import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, setOrderPage, pushOrderToken } from '../features/orders/orderSlice';
import { Search, Eye, ShoppingBag, Clock, CheckCircle, Truck, XCircle, MoreVertical } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: orders, isLoading, nextPageToken, tokenHistory, currentPage, pageSize } = useSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchOrders({ pageSize }));
  }, [dispatch, pageSize]);

  const handleNextPage = () => {
    if (nextPageToken) {
      dispatch(pushOrderToken(nextPageToken));
      dispatch(setOrderPage(currentPage + 1));
      dispatch(fetchOrders({ pageSize, pageToken: nextPageToken }));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevToken = tokenHistory[currentPage - 2];
      dispatch(setOrderPage(currentPage - 1));
      dispatch(fetchOrders({ pageSize, pageToken: prevToken }));
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock className="h-3 w-3" /> },
      processing: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <ShoppingBag className="h-3 w-3" /> },
      shipped: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Truck className="h-3 w-3" /> },
      delivered: { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="h-3 w-3" /> },
      cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="h-3 w-3" /> },
    };

    const config = configs[status.toLowerCase()] || configs.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order ID',
      className: 'font-medium text-gray-900',
      render: (row) => row.orderNumber || `#${row.id.slice(-6).toUpperCase()}`
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.customerName}</div>
          <div className="text-xs text-gray-400 font-normal">{row.customerEmail}</div>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => {
        if (!row.createdAt) return '-';
        return new Date(row.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (row) => (
        <span className="font-semibold text-gray-900">
          ₹{row.totalAmount.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      className: 'text-xs',
      render: (row) => (
        <span className={`font-medium ${row.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
          {row.paymentStatus.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <button
          onClick={() => navigate(`/orders/view/${row.id}`)}
          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
      )
    }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">Track and manage customer orders</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, name or number..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium whitespace-nowrap">Status:</span>
            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 overflow-x-auto">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    statusFilter === status 
                      ? 'bg-white text-primary-600 shadow-sm border border-gray-100' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredOrders}
          isLoading={isLoading}
          emptyMessage="No orders found matching your criteria"
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

export default OrdersPage;
