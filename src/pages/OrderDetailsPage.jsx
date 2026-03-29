import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrderById, updateStatus } from '../features/orders/orderSlice';
import { updatePaymentStatus } from '../api/orderService';
import { updateProductStock } from '../api/productService'; // Added for inventory sync
import { ArrowLeft, Clock, ShoppingBag, Truck, CheckCircle, XCircle, User, MapPin, CreditCard, Package, Download } from 'lucide-react';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import generateInvoice from '../utils/generateInvoice';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedOrder: order, isLoading } = useSelector((state) => state.orders);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    setUpdating(true);
    await dispatch(updateStatus({ id, status: newStatus }));
    
    if (newStatus === 'rejected') {
      for (const item of order.items) {
        await updateProductStock(item.id, item.quantity);
      }
      
      if (order.paymentMethod?.toUpperCase() === 'ONLINE') {
        await updatePaymentStatus(id, 'refunded');
        dispatch(fetchOrderById(id));
      }
    }
    
    setUpdating(false);
  };

  const statusConfigs = {
    pending: { color: 'text-yellow-600 bg-yellow-50 border-yellow-100', icon: <Clock className="h-5 w-5" /> },
    processing: { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: <ShoppingBag className="h-5 w-5" /> },
    shipped: { color: 'text-purple-600 bg-purple-50 border-purple-100', icon: <Truck className="h-5 w-5" /> },
    delivered: { color: 'text-green-600 bg-green-50 border-green-100', icon: <CheckCircle className="h-5 w-5" /> },
    cancelled: { color: 'text-red-600 bg-red-50 border-red-100', icon: <XCircle className="h-5 w-5" /> },
    rejected: { color: 'text-red-600 bg-red-50 border-red-100', icon: <XCircle className="h-5 w-5" /> },
  };

  if (isLoading && !order) return <Loader size="lg" className="p-8" />;
  if (!order) return <div className="p-8 text-center text-red-500 font-medium">Order not found</div>;

  const currentStatusConfig = statusConfigs[order.status.toLowerCase()] || statusConfigs.pending;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 text-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 print:hidden">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber || `#${order.id.slice(-6).toUpperCase()}`}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentStatusConfig.color}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            className="h-10 px-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all disabled:opacity-50 print:hidden"
            value={order.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={updating || ['delivered', 'cancelled', 'rejected'].includes(order.status)}
          >
            <option value={order.status}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</option>
            {order.status === 'pending' && <option value="processing">Processing</option>}
            {order.status === 'pending' && <option value="rejected">Rejected</option>}
            {order.status === 'processing' && <option value="shipped">Shipped</option>}
            {order.status === 'shipped' && <option value="delivered">Delivered</option>}
          </select>
          <Button variant="ghost" className="flex items-center gap-2 print:hidden" onClick={() => generateInvoice(order)}>
            <Download className="h-4 w-4" />
            Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                Items Ordered
              </h3>
              <span className="text-gray-500 font-medium">{order.items.length} Items</span>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-6 flex items-center gap-4 group">
                  <div className="h-20 w-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                    <img src={item.thumbnail} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-gray-500 mt-1">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{item.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Subtotal: ₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50/50 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-3">
                <span>Shipping Fee</span>
                <span className="text-green-600 font-semibold tracking-wide">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-1">
                <span>Total Amount</span>
                <span className="text-primary-600">₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 border-b border-gray-50 pb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              Customer Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-lg">
                  {order.customerName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{order.customerName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.customerEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 border-b border-gray-50 pb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              Shipping Address
            </h3>
            <div className="space-y-3 text-sm leading-relaxed">
              <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                <span className="text-gray-500">Name</span>
                <span className="font-bold text-gray-900 text-right">{order.shippingAddress.name}</span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                <span className="text-gray-500">Street</span>
                <span className="font-medium text-gray-900 text-right max-w-[60%]">{order.shippingAddress.street}</span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                <span className="text-gray-500">City & State</span>
                <span className="font-medium text-gray-900 text-right">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                <span className="text-gray-500">Pincode</span>
                <span className="font-medium text-gray-900">{order.shippingAddress.zip}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-xs">
                <span className="text-gray-500 font-medium uppercase tracking-wider">Phone</span>
                <span className="font-mono font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-md">{order.shippingAddress.phone}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 border-b border-gray-50 pb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              Payment Information
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Method:</span>
              <span className="font-bold text-gray-900">{order.paymentMethod?.toUpperCase() === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Status:</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>
            {order.paymentMethod?.toUpperCase() === 'ONLINE' && order.paymentId && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                <span className="text-gray-500">TXN ID:</span>
                <span className="font-bold text-gray-900 font-mono text-xs truncate max-w-[120px]" title={order.paymentId}>{order.paymentId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
