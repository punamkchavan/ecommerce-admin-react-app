import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { LayoutDashboard, User, LogOut, Package, ShoppingCart, Users, Layers, Menu, X } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Categories', icon: Layers, path: '/categories' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Orders', icon: ShoppingCart, path: '/orders' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary-600 uppercase tracking-wider">Admin Panel</h2>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-400"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 md:py-2 rounded-xl md:rounded-lg transition-all ${
              location.pathname === item.path
                ? 'bg-primary-50 text-primary-600 font-semibold shadow-sm border-primary-100'
                : 'text-gray-600 hover:bg-gray-50'
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
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed md:relative z-50 w-72 md:w-64 h-full bg-white border-r border-gray-200 flex flex-col text-sm
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="font-bold text-primary-600 md:hidden text-lg tracking-tight">Admin</h2>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <Link to="/profile" className="flex items-center gap-3 hover:bg-gray-50 p-1.5 md:p-2 rounded-xl transition-all border border-transparent hover:border-gray-100">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-gray-900">{user?.displayName}</p>
                <p className="text-[10px] text-gray-400 capitalize">{user?.role || 'Administrator'}</p>
              </div>
              <div className="bg-primary-100 h-8 w-8 rounded-full flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm ring-1 ring-primary-200">
                {user?.displayName?.charAt(0)}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
