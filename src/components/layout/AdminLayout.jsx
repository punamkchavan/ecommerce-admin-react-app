import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { LayoutDashboard, User, LogOut, Package, ShoppingCart, Users, Layers } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Categories', icon: Layers, path: '/categories' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Orders', icon: ShoppingCart, path: '/orders' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col text-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary-600 uppercase tracking-wider">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => dispatch(logout())}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="md:hidden">
            <h2 className="font-bold text-primary-600">Admin</h2>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors">
              <div className="bg-primary-100 p-1.5 rounded-full">
                <User className="h-4 w-4 text-primary-600" />
              </div>
              <span className="text-sm font-medium">{user?.displayName}</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
