import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Package, FileText } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/schedule', icon: CalendarDays, label: 'Schedule' },
  { to: '/packages', icon: Package, label: 'Packages' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

export const MobileNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-border z-30 lg:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5"
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? 'text-accent-teal' : 'text-text-muted'}`}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-accent-teal' : 'text-text-muted'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 w-8 h-0.5 bg-accent-teal rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
