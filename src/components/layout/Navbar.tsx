import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadCount } from '../../hooks/useNotifications';
import { NotificationPanel } from '../notifications/NotificationPanel';

interface NavbarProps {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle, mobileMenuOpen }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { data: unreadCount } = useUnreadCount();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-0 lg:left-[240px] h-16 bg-surface/90 backdrop-blur-xl border-b border-border z-30 flex items-center justify-between px-4 lg:px-6 transition-all duration-300">
        {/* Left: Mobile menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-elevated text-text-muted"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="hidden sm:block">
            <h2 className="text-sm font-display font-bold text-text-primary">Good day, Dr. Karthik</h2>
            <p className="text-xs text-text-muted">Manage your clinic</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications Bell */}
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-xl hover:bg-elevated text-text-muted hover:text-text-primary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {(unreadCount ?? 0) > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount! > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          {/* Doctor Profile */}
          <div className="hidden md:flex items-center gap-3 ml-2 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-teal to-accent-mint flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-text-primary">Dr. Karthik</p>
              <p className="text-[10px] text-text-muted">BPT</p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-xl hover:bg-accent-rose/10 text-text-muted hover:text-accent-rose transition-colors"
            aria-label="Sign Out"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
};
