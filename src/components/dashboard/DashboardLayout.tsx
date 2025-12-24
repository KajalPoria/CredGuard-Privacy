import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield,
  Fingerprint,
  History,
  Settings,
  Building2,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Home,
  Bell,
  User,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: 'loan' | 'verification' | 'institution' | 'consent';
  title: string;
  message: string;
  status: 'success' | 'pending' | 'error';
  time: Date;
  read: boolean;
}

const navItems = [
  { title: "Overview", url: "/dashboard", icon: BarChart3 },
  { title: "Credit Identity", url: "/dashboard/identity", icon: Fingerprint },
  { title: "Loan Application", url: "/dashboard/loan", icon: Wallet },
  { title: "Fraud Detection", url: "/dashboard/fraud", icon: AlertTriangle },
  { title: "Verification History", url: "/dashboard/history", icon: History },
  { title: "Consent Management", url: "/dashboard/consent", icon: Settings },
  { title: "Connected Institutions", url: "/dashboard/institutions", icon: Building2 },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string; trust_score: number } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    loans: true,
    verifications: true,
    institutions: true,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const fetchNotifications = async () => {
    if (!user) return;

    // Fetch recent loan applications
    const { data: loans } = await supabase
      .from("loan_applications")
      .select("id, status, decision_status, amount, institution_name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch recent verifications
    const { data: verifications } = await supabase
      .from("verification_history")
      .select("id, verification_type, institution_name, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch recent institutions
    const { data: institutions } = await supabase
      .from("connected_institutions")
      .select("id, institution_name, status, connected_at")
      .eq("user_id", user.id)
      .order("connected_at", { ascending: false })
      .limit(5);

    const newNotifications: Notification[] = [];

    loans?.forEach(loan => {
      const status = loan.decision_status === 'accepted' ? 'success' : 
                     loan.decision_status === 'rejected' ? 'error' : 'pending';
      newNotifications.push({
        id: `loan-${loan.id}`,
        type: 'loan',
        title: status === 'success' ? 'Loan Approved!' : 
               status === 'error' ? 'Loan Rejected' : 'Loan Application Submitted',
        message: `$${Number(loan.amount).toLocaleString()} ${loan.institution_name ? `to ${loan.institution_name}` : ''}`,
        status,
        time: new Date(loan.created_at),
        read: false,
      });
    });

    verifications?.forEach(ver => {
      const status = ver.status === 'verified' || ver.status === 'approved' ? 'success' : 'pending';
      newNotifications.push({
        id: `ver-${ver.id}`,
        type: 'verification',
        title: status === 'success' ? 'Verification Complete' : 'Verification Pending',
        message: `${ver.verification_type} with ${ver.institution_name}`,
        status,
        time: new Date(ver.created_at),
        read: false,
      });
    });

    institutions?.forEach(inst => {
      newNotifications.push({
        id: `inst-${inst.id}`,
        type: 'institution',
        title: 'Institution Connected',
        message: `${inst.institution_name} is now connected`,
        status: inst.status === 'active' ? 'success' : 'pending',
        time: new Date(inst.connected_at),
        read: false,
      });
    });

    // Sort by time
    newNotifications.sort((a, b) => b.time.getTime() - a.time.getTime());
    setNotifications(newNotifications.slice(0, 10));
  };

  // Load notification preferences from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`notification_prefs_${user.id}`);
      if (saved) {
        try {
          setNotificationPrefs(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse notification preferences');
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("display_name, trust_score")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
      
      fetchNotifications();
    }
  }, [user]);

  // Real-time subscription for notifications (respects preferences)
  useEffect(() => {
    if (!user) return;

    const loansChannel = supabase
      .channel('notifications-loans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loan_applications', filter: `user_id=eq.${user.id}` }, (payload) => {
        console.log('Loan notification:', payload);
        fetchNotifications();
        if (notificationPrefs.loans && payload.eventType === 'UPDATE' && payload.new) {
          const loan = payload.new as any;
          if (loan.decision_status === 'accepted') {
            toast({ title: "Loan Approved!", description: `Your loan of $${Number(loan.amount).toLocaleString()} has been approved.` });
          }
        }
      })
      .subscribe();

    const verificationsChannel = supabase
      .channel('notifications-verifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'verification_history', filter: `user_id=eq.${user.id}` }, () => {
        fetchNotifications();
        if (notificationPrefs.verifications) {
          toast({ title: "Verification Added", description: "A new verification has been recorded." });
        }
      })
      .subscribe();

    const institutionsChannel = supabase
      .channel('notifications-institutions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connected_institutions', filter: `user_id=eq.${user.id}` }, (payload) => {
        fetchNotifications();
        if (notificationPrefs.institutions) {
          const inst = payload.new as any;
          toast({ title: "Institution Connected", description: `${inst.institution_name} is now connected.` });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(loansChannel);
      supabase.removeChannel(verificationsChannel);
      supabase.removeChannel(institutionsChannel);
    };
  }, [user, notificationPrefs]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'error': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="hidden lg:flex flex-col bg-card border-r border-border fixed left-0 top-0 bottom-0 z-40"
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-border">
          <a href="/" className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-lg font-bold text-foreground">
                CRED<span className="text-gradient">GUARD</span>
              </span>
            )}
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.url;
            
            return (
              <NavLink
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
                end
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-border space-y-2">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Back to Home</span>}
          </a>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <a href="/" className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary" />
          <span className="text-lg font-bold text-foreground">
            CRED<span className="text-gradient">GUARD</span>
          </span>
        </a>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          className="lg:hidden fixed inset-0 z-40 bg-background pt-16"
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.url;
              
              return (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                  end
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </NavLink>
              );
            })}
            <hr className="border-border my-4" />
            <a
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </a>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </nav>
        </motion.div>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="h-20 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 lg:px-8 mt-16 lg:mt-0">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {profile?.display_name || user?.email?.split("@")[0] || "User"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center text-primary-foreground font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">Notifications</h3>
                        {unreadCount > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-muted-foreground hover:text-foreground"
                            onClick={markAllAsRead}
                          >
                            Mark all read
                          </Button>
                        )}
                      </div>
                      <ScrollArea className="max-h-80">
                        {notifications.length > 0 ? (
                          <div className="divide-y divide-border">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-secondary/50 transition-colors cursor-pointer ${
                                  !notification.read ? 'bg-primary/5' : ''
                                }`}
                                onClick={() => {
                                  if (notification.type === 'loan') navigate('/dashboard/loan');
                                  if (notification.type === 'verification') navigate('/dashboard/history');
                                  if (notification.type === 'institution') navigate('/dashboard/institutions');
                                  setShowNotifications(false);
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5">
                                    {getStatusIcon(notification.status)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                      {formatTimeAgo(notification.time)}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                          </div>
                        )}
                      </ScrollArea>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <NavLink
              to="/dashboard/profile"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            >
              <User className="w-5 h-5 text-primary-foreground" />
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
