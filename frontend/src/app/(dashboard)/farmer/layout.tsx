'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Store, 
  Gavel, 
  Package, 
  ShieldCheck, 
  Landmark,
  MessageSquare,
  Truck,
  Bell,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  ShoppingBag,
  BarChart3
} from 'lucide-react';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { DemoBanner } from '@/components/DemoBanner';

const navItems = [
  { name: 'Dashboard', href: '/farmer', icon: LayoutDashboard },
  { name: 'My Crops', href: '/farmer/crops', icon: Store },
  { name: 'My Auctions', href: '/farmer/auctions', icon: Gavel },
  { name: 'Inventory', href: '/farmer/inventory', icon: Package },
  { name: 'Orders', href: '/farmer/orders', icon: ShoppingBag },
  { name: 'Deliveries', href: '/farmer/deliveries', icon: Truck },
  { name: 'Credit & Loans', href: '/farmer/credit', icon: ShieldCheck },
  { name: 'Loans', href: '/farmer/loans', icon: Landmark },
  { name: 'AI Assistant', href: '/farmer/ai', icon: MessageSquare },
  { name: 'Analytics', href: '/farmer/analytics', icon: BarChart3 },
];

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const Sidebar = ({ isMobile = false }) => (
    <div className={`flex flex-col h-full bg-secondary/20 border-r border-border/50 glass-card rounded-none lg:rounded-r-3xl overflow-hidden transition-all duration-300 ${!isMobile && (collapsed ? 'w-20' : 'w-64')}`}>
      <div className="p-4 flex items-center justify-between h-20 border-b border-border/50">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-white font-heading font-bold text-xl shrink-0">
              A
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-foreground truncate">
              AgriBridge
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-primary-gradient flex items-center justify-center text-white font-heading font-bold text-xl shrink-0">
            A
          </div>
        )}
        {!isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex shrink-0">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)}>
              <div className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active" 
                    className="absolute inset-0 bg-primary/10 rounded-xl -z-10 border border-primary/20" 
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} className="shrink-0" />
                {!collapsed && <span className="font-medium text-sm truncate">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        <Link href="/farmer/profile" onClick={() => setMobileOpen(false)}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
            <Avatar className={`w-9 h-9 border ${user?.isDemoAccount ? 'border-amber-500' : 'border-border'}`}>
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                {user?.name?.substring(0, 2).toUpperCase() || 'FM'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold truncate text-foreground">{user?.name || 'Loading...'}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.isDemoAccount ? 'Farmer Demo' : 'Farmer Account'}</span>
              </div>
            )}
          </div>
        </Link>
        <Button variant="ghost" className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'justify-start gap-3 px-2'} hover:bg-destructive/10 hover:text-destructive transition-colors`} onClick={logout}>
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Log out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['farmer']}>
      <div className="h-screen w-full flex bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full z-20">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="relative w-64 h-full z-50"
            >
              <Sidebar isMobile />
            </motion.div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
          
          {/* Topbar */}
          <header className="h-20 glass border-b border-border/50 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu size={24} />
              </Button>
              <h1 className="font-heading font-bold text-xl lg:text-2xl text-foreground">
                {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {user?.isDemoAccount && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
                  Demo Account
                </span>
              )}
              {/* Real Notification Bell with real user ID */}
              <NotificationBell userId={user?._id || 'mock-farmer-id'} />
            </div>
          </header>

          <DemoBanner />

          {/* Scrollable Main View */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
