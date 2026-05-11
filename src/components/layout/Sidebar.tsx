import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Package,
  FileText,
  Bell,
  ChevronLeft,
  Activity,
  User,
} from 'lucide-react';
import { useDoctorProfile } from '../../hooks/useDoctorProfile';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/schedule', icon: CalendarDays, label: 'Schedule' },
  { to: '/packages', icon: Package, label: 'Packages' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, onMobileClose }) => {
  const location = useLocation();
  const { data: profile } = useDoctorProfile();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-surface border-r border-border z-40 flex flex-col hidden lg:flex"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-teal to-accent-mint flex items-center justify-center flex-shrink-0">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <h1 className="font-display font-bold text-sm leading-tight text-text-primary whitespace-nowrap">
                SRI KAVITHA
              </h1>
              <p className="text-[10px] text-text-muted whitespace-nowrap">PHYSIOTHERAPY</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Doctor Profile Link */}
      <div className="px-3 pb-1">
        <Link
          to="/profile"
          onClick={onMobileClose}
          className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group ${
            location.pathname === '/profile'
              ? 'bg-sky-500/10 border border-sky-500/20'
              : 'hover:bg-slate-700/50 border border-transparent hover:border-slate-600/40'
          }`}
          title={collapsed ? 'Doctor Profile' : undefined}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden border-2 border-sky-500/40 flex-shrink-0 relative flex items-center justify-center">
            {profile?.photo_url ? (
              <img src={profile.photo_url} className="w-full h-full object-cover" alt="Dr. Karthik" />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-800" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-sm font-semibold text-white truncate">
                  {profile?.full_name || 'Dr. Karthik'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {profile?.qualification || 'BPT'} · Physiotherapist
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-elevated text-text-muted hover:text-text-primary transition-colors"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </button>
      </div>
    </motion.aside>
  );
};

