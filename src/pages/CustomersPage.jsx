import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, setCustomerPage, pushCustomerToken } from '../features/customers/customerSlice';
import { Search, Eye, Users, Mail, Phone, Calendar, IndianRupee } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import { useNavigate } from 'react-router-dom';

const CustomersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: customers, isLoading, nextPageToken, tokenHistory, currentPage, pageSize } = useSelector((state) => state.customers);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCustomers({ pageSize }));
  }, [dispatch, pageSize]);

  const handleNextPage = () => {
    if (nextPageToken) {
      dispatch(pushCustomerToken(nextPageToken));
      dispatch(setCustomerPage(currentPage + 1));
      dispatch(fetchCustomers({ pageSize, pageToken: nextPageToken }));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevToken = tokenHistory[currentPage - 2];
      dispatch(setCustomerPage(currentPage - 1));
      dispatch(fetchCustomers({ pageSize, pageToken: prevToken }));
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-400 font-normal">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => row.phone || '-'
    },
    {
      key: 'totalOrders',
      label: 'Orders',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
          {row.totalOrders}
        </span>
      )
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      render: (row) => (
        <span className="font-semibold text-gray-900">
          ₹{row.totalSpent.toLocaleString()}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (row) => {
        if (!row.createdAt) return '-';
        return new Date(row.createdAt).toLocaleDateString('en-IN', {
          month: 'short',
          year: 'numeric'
        });
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          row.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
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
          onClick={() => navigate(`/customers/view/${row.id}`)}
          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
      )
    }
  ];

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">View and manage your customer database</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredCustomers}
          isLoading={isLoading}
          emptyMessage="No customers found"
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

export default CustomersPage;
