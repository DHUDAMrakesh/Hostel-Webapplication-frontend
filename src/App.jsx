import React, { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';
import { SkeletonPage } from './components/Skeleton';

// ─── Lazy-loaded page bundles (each becomes its own JS chunk) ───
const Dashboard = lazy(() => import('./components/Dashboard'));
const FoodMenu = lazy(() => import('./components/FoodMenu'));
const Facilities = lazy(() => import('./components/Facilities'));
const Payments = lazy(() => import('./components/Payments'));
const Students = lazy(() => import('./components/Students'));
const Rooms = lazy(() => import('./components/Rooms'));
const Settings = lazy(() => import('./components/Settings'));
const Unauthorized = lazy(() => import('./components/Unauthorized'));
const FinanceAdmin = lazy(() => import('./components/FinanceAdmin'));
const StudentDashboard = lazy(() => import('./components/Student/StudentDashboard'));
const MyRoom = lazy(() => import('./components/Student/MyRoom'));
const MyFees = lazy(() => import('./components/Student/MyFees'));
const MyComplaints = lazy(() => import('./components/Student/MyComplaints'));
const AdminComplaints = lazy(() => import('./components/AdminComplaints'));
const NotificationCenter = lazy(() => import('./components/NotificationCenter'));
const Announcements = lazy(() => import('./components/Announcements'));

// Profile panels are small and used immediately on auth — keep eager
import StudentProfilePanel from './components/Student/StudentProfilePanel';
import AdminProfilePanel from './components/AdminProfilePanel';
import { useSettings } from './context/SettingsContext';
import { useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import api, { onConnectivityChange } from './utils/api';

// Suspense wrapper with skeleton fallback
const PageSuspense = ({ children, rows = false }) => (
  <Suspense fallback={<SkeletonPage cards={6} stats={4} rows={rows} />}>
    {children}
  </Suspense>
);

// ─── SVG Icon components ──────────────────────────────────────────────────────
const Icon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props} />
);

const Icons = {
  Dashboard: (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></Icon>,
  FoodMenu: (p) => <Icon {...p}><path d="M3 7h18M3 12h18M3 17h18" /><circle cx="5" cy="7" r="1" fill="currentColor" stroke="none" /><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="5" cy="17" r="1" fill="currentColor" stroke="none" /></Icon>,
  Facilities: (p) => <Icon {...p}><path d="M3 9l9-7 9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" /><polyline points="9,22 9,12 15,12 15,22" /></Icon>,
  Students: (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></Icon>,
  Rooms: (p) => <Icon {...p}><rect x="2" y="7" width="20" height="15" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" /></Icon>,
  Payments: (p) => <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></Icon>,
  Complaints: (p) => <Icon {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></Icon>,
  Settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></Icon>,
  Logout: (p) => <Icon {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>,
  Fees: (p) => <Icon {...p}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></Icon>,
  MyRoom: (p) => <Icon {...p}><path d="M2 7l10-5 10 5v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" /><path d="M9 22V12h6v10" /></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>,
  Bell: (p) => <Icon {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></Icon>,
  Megaphone: (p) => <Icon {...p}><path d="M3 11l19-9-9 19-2-8-8-2z" /></Icon>,
  ChevronLeft: (p) => <Icon {...p}><polyline points="15,18 9,12 15,6" /></Icon>,
  ChevronRight: (p) => <Icon {...p}><polyline points="9,18 15,12 9,6" /></Icon>,
};

// Role badge styles
const ROLE_COLORS = {
  admin: { bg: '#7c3aed', label: 'Admin', gradient: 'linear-gradient(135deg, #7c3aed, #9333ea)' },
  manager: { bg: '#0ea5e9', label: 'Manager', gradient: 'linear-gradient(135deg, #0ea5e9, #0891b2)' },
  student: { bg: '#10b981', label: 'Student', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
};

// Nav items — per-role definitions with icon component
const ALL_NAV_ITEMS = [
  // Admin + Manager pages
  { id: 'dashboard', label: 'Dashboard', Icon: Icons.Dashboard, roles: ['admin', 'manager'] },
  { id: 'menu', label: 'Food Menu', Icon: Icons.FoodMenu, roles: ['admin', 'manager'] },
  { id: 'facilities', label: 'Facilities', Icon: Icons.Facilities, roles: ['admin', 'manager'] },
  { id: 'students', label: 'Students', Icon: Icons.Students, roles: ['admin', 'manager'] },
  { id: 'rooms', label: 'Rooms', Icon: Icons.Rooms, roles: ['admin', 'manager'] },
  { id: 'payments', label: 'Manage Payments', Icon: Icons.Payments, roles: ['admin', 'manager'] },
  { id: 'finance', label: 'Finance Center', Icon: Icons.Fees, roles: ['admin'] },
  { id: 'complaints', label: 'Complaints', Icon: Icons.Complaints, roles: ['admin', 'manager'] },
  { id: 'announcements', label: 'Announcements', Icon: Icons.Megaphone, roles: ['admin', 'manager'] },
  // Student-only pages
  { id: 'dashboard', label: 'My Dashboard', Icon: Icons.Dashboard, roles: ['student'] },
  { id: 'room', label: 'My Room', Icon: Icons.MyRoom, roles: ['student'] },
  { id: 'fees', label: 'Fees', Icon: Icons.Fees, roles: ['student'] },
  { id: 'complaints', label: 'Complaints', Icon: Icons.Complaints, roles: ['student'] },
  { id: 'menu', label: 'Food Menu', Icon: Icons.FoodMenu, roles: ['student'] },
  { id: 'facilities', label: 'Facilities', Icon: Icons.Facilities, roles: ['student'] },
  { id: 'announcements', label: 'Notices', Icon: Icons.Megaphone, roles: ['student'] },
];

// Build the full path for a page using the current role prefix
const rolePath = (role, page) => `/${role}/${page}`;

// ─── Layout ──────────────────────────────────────────────────────────────────
const Layout = ({ settings, collapsed, setCollapsed, handleLogout, user }) => {
  const { updateSettings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'student';
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [health, setHealth] = React.useState({ server: true, database: true });

  React.useEffect(() => {
    // Listen for network level errors from api.js
    const unsub = onConnectivityChange((online) => {
      setHealth(h => ({ ...h, server: online }));
    });

    // Periodically poll health endpoint for DB status
    const checkHealth = async () => {
      try {
        const { data } = await api.get('/health', { _skipRetry: true });
        setHealth({ server: true, database: data.database === 'connected' });
      } catch (err) {
        // If it's a network error, api.js will notify via listener
        // If it's a 503 from our health check, it means DB is down but server is up
        if (err.response?.status === 503) {
          setHealth({ server: true, database: false });
        }
      }
    };

    const timer = setInterval(checkHealth, 10000); // Check every 10s
    checkHealth(); // Initial check

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(role));

  // Derive active tab from current pathname
  const homeId = 'dashboard';
  const activeId = navItems.find(item => location.pathname === rolePath(role, item.id))?.id
    || (location.pathname === rolePath(role, 'settings') ? 'settings' : homeId);

  const getPageTitle = () => {
    if (activeId === 'settings') return 'Settings';
    return navItems.find(i => i.id === activeId)?.label || 'Dashboard';
  };

  const roleInfo = ROLE_COLORS[role] || ROLE_COLORS.student;
  const userName = user?.name || settings.adminName || 'User';
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="app-layout" style={{
      '--accent': settings.accentColor,
      '--accent-glow': settings.accentColor + '55',
      '--accent-muted': settings.accentColor + '33',
    }}>
      {/* Sidebar */}
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        {/* Logo */}
        <button
          className="sidebar-logo"
          onClick={() => navigate(rolePath(role, homeId))}
        >
          <div className="logo-icon" style={{
            background: `linear-gradient(135deg, ${settings.accentColor}, #a855f7)`,
            boxShadow: `0 0 0 3px ${settings.accentColor}22, 0 4px 16px ${settings.accentColor}40`
          }}>
            {settings.hostelName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="logo-text">
              <div className="logo-title">{settings.hostelName}</div>
              <div className="logo-sub">Management</div>
            </div>
          )}
        </button>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id + item.label}
                onClick={() => navigate(rolePath(role, item.id))}
                className={`nav-btn${isActive ? ' active' : ''}`}
                title={collapsed ? item.label : undefined}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${settings.accentColor}18, ${settings.accentColor}08)`,
                  borderColor: `${settings.accentColor}30`,
                  color: settings.accentColor,
                } : {}}
              >
                <item.Icon size={17} style={isActive ? { opacity: 1 } : { opacity: 0.65 }} />
                <span className="nav-label">{item.label}</span>
                {isActive && !collapsed && (
                  <span style={{
                    marginLeft: 'auto',
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: settings.accentColor,
                    boxShadow: `0 0 8px ${settings.accentColor}`,
                    flexShrink: 0,
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          {/* User card at bottom */}
          {!collapsed && (
            <div
              onClick={() => setProfileOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 11,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer', marginBottom: 6,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.background = 'var(--bg-overlay)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: roleInfo.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: 'white', flexShrink: 0,
                boxShadow: `0 0 10px ${roleInfo.bg}40`,
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userName.split(' ')[0]}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.06em', color: roleInfo.bg,
                }}>
                  {roleInfo.label}
                </div>
              </div>
            </div>
          )}

          {/* Settings — admin only */}
          {role === 'admin' && (
            <button
              className={`nav-btn${activeId === 'settings' ? ' active' : ''}`}
              onClick={() => navigate(rolePath(role, 'settings'))}
              title={collapsed ? 'Settings' : undefined}
              style={activeId === 'settings' ? {
                background: `${settings.accentColor}18`,
                borderColor: `${settings.accentColor}30`,
                color: settings.accentColor,
              } : {}}
            >
              <Icons.Settings size={17} style={{ opacity: activeId === 'settings' ? 1 : 0.65 }} />
              <span className="nav-label">Settings</span>
            </button>
          )}
          <button className="nav-btn" title={collapsed ? 'Logout' : undefined} onClick={handleLogout}
            style={{ color: 'var(--brand-rose)' }}
          >
            <Icons.Logout size={17} style={{ opacity: 0.65 }} />
            <span className="nav-label">Logout</span>
          </button>
        </div>

        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Icons.ChevronRight size={12} /> : <Icons.ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">{getPageTitle()}</div>
            <div className="topbar-sub">{greeting}, {userName.split(' ')[0]} · {dateStr}</div>
          </div>
          <div className="topbar-right">
            {/* Search bar */}
            <div className="topbar-search">
              <Icons.Search size={15} />
              <input placeholder="Search anything..." />
            </div>

            {/* Status */}
            <div className="status-badge" style={{ 
              display: window.innerWidth < 768 ? 'none' : 'flex',
              background: !health.server ? '#fee2e2' : (!health.database ? '#fff7ed' : 'var(--bg-elevated)'),
              color: !health.server ? '#dc2626' : (!health.database ? '#ea580c' : 'var(--text-secondary)'),
              borderColor: !health.server ? '#fca5a5' : (!health.database ? '#fdba74' : 'var(--border-subtle)'),
            }}>
              <span className="status-dot" style={{ 
                background: !health.server ? '#dc2626' : (!health.database ? '#ea580c' : '#10b981'),
                boxShadow: `0 0 8px ${!health.server ? '#dc2626' : (!health.database ? '#ea580c' : '#10b981')}60`
              }} />
              {!health.server ? 'Backend Disconnected' : (!health.database ? 'Database Error' : 'System Operational')}
            </div>

            {/* Notifications — admin/manager */}
            {(role === 'admin' || role === 'manager') && (
              <Suspense fallback={null}>
                <NotificationCenter accentColor={settings.accentColor} />
              </Suspense>
            )}

            {/* Role badge */}
            <div className="role-badge" style={{
              background: roleInfo.bg + '18',
              border: `1px solid ${roleInfo.bg}40`,
              color: roleInfo.bg,
            }}>
              {roleInfo.label}
            </div>

            {/* Avatar — clickable for all roles */}
            <div
              className="avatar"
              onClick={() => setProfileOpen(true)}
              style={{
                background: roleInfo.gradient,
                outline: `2px solid ${roleInfo.bg}30`,
                outlineOffset: 2,
              }}
              title="My Profile"
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.20, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Global Connectivity Alert Overlay */}
      <AnimatePresence>
        {!health.server && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              background: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 12, zIndex: 9999,
              boxShadow: '0 10px 25px rgba(239,68,68,0.4)', fontWeight: 600,
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            <span style={{ fontSize: 20 }}>⚠️</span>
            Connection lost. Attempting to reconnect...
          </motion.div>
        )}
        {health.server && !health.database && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed', top: 80, right: 24,
              background: '#fff7ed', border: '1px solid #fdba74', color: '#ea580c',
              padding: '12px 20px', borderRadius: 12, zIndex: 9999,
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600,
              fontSize: 14, fontFamily: 'Outfit, sans-serif'
            }}
          >
            <span>🏮</span>
            Database is currently offline. Some features may not work.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student profile slide panel */}
      {role === 'student' && profileOpen && (
        <StudentProfilePanel
          onClose={() => setProfileOpen(false)}
          theme={settings.theme}
          onThemeChange={(t) => updateSettings({ theme: t })}
        />
      )}

      {/* Admin / Manager profile slide panel */}
      {(role === 'admin' || role === 'manager') && profileOpen && (
        <AdminProfilePanel
          onClose={() => setProfileOpen(false)}
          theme={settings.theme}
          onThemeChange={(t) => updateSettings({ theme: t })}
        />
      )}
    </div>
  );
};

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ allowedRoles, urlRole, children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (urlRole && urlRole !== user?.role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const Spinner = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh',
    background: 'var(--bg-base)',
    gap: 16,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      border: '3px solid var(--border-default)',
      borderTopColor: '#6366f1',
      animation: 'spin 0.8s linear infinite',
    }} />
    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Loading…</div>
  </div>
);

const RoleDashboard = () => {
  const { user } = useAuth();
  if (!user) return <Spinner />;
  return user.role === 'student' ? <StudentDashboard /> : <Dashboard />;
};

const RoleComplaints = () => {
  const { user } = useAuth();
  if (!user) return <Spinner />;
  return user.role === 'student' ? <MyComplaints /> : <AdminComplaints />;
};

const RoleLayout = ({ settings, collapsed, setCollapsed, handleLogout }) => {
  const { role: urlRole } = useParams();
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  if (urlRole !== user.role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <Layout
      settings={settings}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      handleLogout={handleLogout}
      user={user}
    />
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [collapsed, setCollapsed] = React.useState(false);
  const { settings } = useSettings();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const accentStyle = {
    '--accent': settings.accentColor,
    '--accent-glow': settings.accentColor + '55',
  };

  const handleLogin = (userData) => { navigate(`/${userData.role}/dashboard`); };
  const handleSignup = (userData) => { navigate(`/${userData.role}/dashboard`); };
  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return <Spinner />;

  return (
    <div className="app-container" style={accentStyle}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* ── Public routes ── */}
          <Route path="/login" element={
            !isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                className="w-full h-full"
              >
                <Login onLogin={handleLogin} onSwitchToSignup={() => navigate('/signup')} />
              </motion.div>
            ) : <Navigate to={`/${user.role}/dashboard`} replace />
          } />

          <Route path="/signup" element={
            !isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                className="w-full h-full"
              >
                <Signup onSignup={handleSignup} onSwitchToLogin={() => navigate('/login')} />
              </motion.div>
            ) : <Navigate to={`/${user.role}/dashboard`} replace />
          } />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ── Role-prefixed protected routes ── */}
          <Route
            path="/:role"
            element={
              <ProtectedRoute>
                <RoleLayout
                  settings={settings}
                  collapsed={collapsed}
                  setCollapsed={setCollapsed}
                  handleLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<RoleDashboard />} />
            <Route path="menu" element={<PageSuspense><FoodMenu /></PageSuspense>} />
            <Route path="facilities" element={<PageSuspense><Facilities /></PageSuspense>} />

            <Route path="students" element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <PageSuspense rows><Students /></PageSuspense>
              </ProtectedRoute>
            } />
            <Route path="rooms" element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <PageSuspense><Rooms /></PageSuspense>
              </ProtectedRoute>
            } />
            <Route path="payments" element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <PageSuspense rows><Payments /></PageSuspense>
              </ProtectedRoute>
            } />
            <Route path="finance" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageSuspense rows><FinanceAdmin /></PageSuspense>
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageSuspense><Settings /></PageSuspense>
              </ProtectedRoute>
            } />
            <Route path="room" element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageSuspense><MyRoom /></PageSuspense>
              </ProtectedRoute>
            } />
            <Route path="fees" element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageSuspense rows><MyFees /></PageSuspense>
              </ProtectedRoute>
            } />
            <Route path="complaints" element={<RoleComplaints />} />
            <Route path="announcements" element={
              <PageSuspense><Announcements /></PageSuspense>
            } />
          </Route>

          {/* ── Root & fallback ── */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Navigate to="/login" replace />
          } />
          <Route path="*" element={
            isAuthenticated ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Navigate to="/login" replace />
          } />

        </Routes>
      </AnimatePresence>
    </div>
  );
}
