import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  MessageSquare,
  Tag,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'] },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'] },
  { path: '/admin/users', icon: Users, label: 'Users', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'] },
  { path: '/admin/reviews', icon: MessageSquare, label: 'Reviews', roles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'] },
  { path: '/admin/promo', icon: Tag, label: 'Promo Codes', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/admin/settings', icon: Settings, label: 'Settings', roles: ['SUPER_ADMIN'] },
];

export function Sidebar() {
  const location = useLocation();
  const { admin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = menuItems.filter(item =>
    item.roles.includes(admin?.role || '')
  );

  return (
    <aside className={`bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <span className="text-lg font-bold text-white">Admin</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        {!collapsed && (
          <div className="mb-4 px-3">
            <div className="text-sm font-medium text-white truncate">{admin?.email}</div>
            <div className="text-xs text-slate-400">{admin?.role}</div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2.5 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
