import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCustomerById } from '../features/customers/customerSlice';
import { fetchOrders } from '../features/orders/orderSlice';
import { ArrowLeft, Mail, Phone, Calendar, IndianRupee, ShoppingBag, Clock, CheckCircle, Truck, XCircle, MapPin } from 'lucide-react';
import DataTable from '../components/common/DataTable';

const CustomerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedCustomer: customer, isLoading: customerLoading } = useSelector((state) => state.customers);
  const { items: orders, isLoading: ordersLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchCustomerById(id));
    dispatch(fetchOrders({ pageSize: 50 }));
  }, [dispatch, id]);

  if (customerLoading && !customer) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  if (!customer) return <div className="p-8 text-center text-red-500 font-medium">Customer not found</div>;

  const customerOrders = orders.filter(o => o.customerId === id);

  const getStatusBadge = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3" /> },
      processing: { color: 'bg-blue-100 text-blue-700', icon: <ShoppingBag className="h-3 w-3" /> },
      shipped: { color: 'bg-purple-100 text-purple-700', icon: <Truck className="h-3 w-3" /> },
      delivered: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" /> },
      cancelled: { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
    };
    const config = configs[status.toLowerCase()] || configs.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${config.color}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order ID',
      render: (row) => (
        <button 
          onClick={() => navigate(`/orders/view/${row.id}`)}
          className="text-primary-600 font-medium hover:underline"
        >
          {row.orderNumber || `#${row.id.slice(-6).toUpperCase()}`}
        </button>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (row) => <span className="font-semibold">₹{row.totalAmount.toLocaleString()}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => getStatusBadge(row.status)
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 text-sm">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Customers
      </button>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="h-24 w-24 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-3xl border-4 border-white shadow-xl">
            {customer.name.charAt(0)}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {customer.email}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{customer.totalOrders}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Spent</p>
                <p className="text-xl font-bold text-primary-600">₹{customer.totalSpent.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Member Since</p>
                <p className="text-xl font-bold text-gray-900">{new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Status</p>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {customer.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-gray-400" />
                Order History
              </h3>
            </div>
            <DataTable 
              columns={columns}
              data={customerOrders}
              isLoading={ordersLoading}
              emptyMessage="No orders found for this customer"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 border-b border-gray-50 pb-4 flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              Contact Information
            </h3>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">{customer.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
