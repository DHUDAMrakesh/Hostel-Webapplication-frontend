import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FoodMenu from './components/FoodMenu';
import Facilities from './components/Facilities';
import Payments from './components/Payments';
import Students from './components/Students';
import Settings from './components/Settings';
import Unauthorized from './components/Unauthorized';
import StudentDashboard from './components/Student/StudentDashboard';
import MyRoom from './components/Student/MyRoom';
import MyFees from './components/Student/MyFees';
import MyComplaints from './components/Student/MyComplaints';
import StudentProfilePanel from './components/Student/StudentProfilePanel';
import { useSettings } from './context/SettingsContext';
import { useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

// Role badge styles
const ROLE_COLORS = {
  admin: { bg: '#7c3aed', label: 'Admin' },
  manager: { bg: '#0ea5e9', label: 'Manager' },
  student: { bg: '#10b981', label: 'Student' },
};

// Nav items — per-role definitions
const ALL_NAV_ITEMS = [
  // Admin + Manager pages
  { id: 'dashboard', label: 'Dashboard', icon: '⊞', roles: ['admin', 'manager'] },
  { id: 'menu', label: 'Food Menu', icon: '🍽', roles: ['admin', 'manager'] },
  { id: 'facilities', label: 'Facilities', icon: '✦', roles: ['admin', 'manager'] },
  { id: 'students', label: 'Students', icon: '🎓', roles: ['admin', 'manager'] },
  { id: 'payments', label: 'Manage Payments', icon: '💳', roles: ['admin', 'manager'] },
  // Student-only pages
  { id: 'dashboard', label: 'My Dashboard', icon: '⊞', roles: ['student'] },
  { id: 'room', label: 'My Room', icon: '🛏', roles: ['student'] },
  { id: 'fees', label: 'Fees', icon: '💳', roles: ['student'] },
  { id: 'complaints', label: 'Complaints', icon: '💬', roles: ['student'] },
  { id: 'menu', label: 'Food Menu', icon: '🍽', roles: ['student'] },
  { id: 'facilities', label: 'Facilities', icon: '✦', roles: ['student'] },
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

  return (
    <div className="app-layout" style={{
      '--accent': settings.accentColor,
      '--accent-glow': settings.accentColor + '55',
    }}>
      {/* Sidebar */}
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        <button
          className="sidebar-logo"
          onClick={() => navigate(rolePath(role, homeId))}
          style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
        >
          <div className="logo-icon" style={{
            background: `linear-gradient(135deg, ${settings.accentColor}, #a855f7)`,
            boxShadow: `0 0 20px ${settings.accentColor}66`
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
                key={item.id}
                onClick={() => navigate(rolePath(role, item.id))}
                className={`nav-btn${isActive ? ' active' : ''}`}
                title={collapsed ? item.label : undefined}
                style={isActive ? {
                  background: `${settings.accentColor}1a`,
                  borderColor: `${settings.accentColor}44`,
                  boxShadow: `0 0 20px ${settings.accentColor}14`,
                } : {}}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          {/* Settings — admin only */}
          {role === 'admin' && (
            <button
              className={`nav-btn${activeId === 'settings' ? ' active' : ''}`}
              onClick={() => navigate(rolePath(role, 'settings'))}
              title={collapsed ? 'Settings' : undefined}
              style={activeId === 'settings' ? {
                background: `${settings.accentColor}1a`,
                borderColor: `${settings.accentColor}44`,
              } : {}}
            >
              <span style={{ fontSize: 16 }}>⚙</span>
              <span className="nav-label">Settings</span>
            </button>
          )}
          <button className="nav-btn" title={collapsed ? 'Logout' : undefined} onClick={handleLogout}>
            <span style={{ fontSize: 16 }}>↪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>

        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">{getPageTitle()}</div>
            <div className="topbar-sub">Welcome back, {user?.name || settings.adminName}</div>
          </div>
          <div className="topbar-right">
            <div className="status-badge">
              <span className="status-dot" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
              All systems operational
            </div>
            {/* Role badge */}
            <div style={{
              padding: '4px 12px',
              borderRadius: 20,
              background: roleInfo.bg + '22',
              border: `1px solid ${roleInfo.bg}55`,
              color: roleInfo.bg,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}>
              {roleInfo.label}
            </div>
            {/* Avatar — clickable for student to open profile panel */}
            <div
              className="avatar"
              onClick={() => role === 'student' && setProfileOpen(true)}
              style={{
                background: `linear-gradient(135deg, ${settings.accentColor}, #a855f7)`,
                cursor: role === 'student' ? 'pointer' : 'default',
                outline: role === 'student' ? `2px solid ${settings.accentColor}66` : 'none',
                outlineOffset: 2,
              }}
              title={role === 'student' ? 'My Profile' : user?.email}
            >
              {(user?.name || settings.adminName).charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Student profile slide panel */}
      {role === 'student' && profileOpen && (
        <StudentProfilePanel
          onClose={() => setProfileOpen(false)}
          theme={settings.theme}
          onThemeChange={(t) => updateSettings({ theme: t })}
        />
      )}
    </div>
  );
};

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Validates authentication. If allowedRoles provided, also checks user role.
// If urlRole provided, ensures the URL role segment matches the actual user role.
const ProtectedRoute = ({ allowedRoles, urlRole, children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If URL has a role segment, it must match the real user role
  if (urlRole && urlRole !== user?.role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f0f' }}>
    <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #333', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

// Renders the correct dashboard based on the logged-in user's role
const RoleDashboard = () => {
  const { user } = useAuth();
  if (!user) return <Spinner />;
  return user.role === 'student' ? <StudentDashboard /> : <Dashboard />;
};

// ─── RoleLayout wrapper ────────────────────────────────────────────────────────
// Reads :role from URL, validates it matches logged-in user, then renders Layout
const RoleLayout = ({ settings, collapsed, setCollapsed, handleLogout }) => {
  const { role: urlRole } = useParams();
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role in URL → redirect to correct role's home
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

  const handleLogin = (userData) => {
    navigate(`/${userData.role}/dashboard`);
  };

  const handleSignup = (userData) => {
    navigate(`/${userData.role}/dashboard`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <Spinner />;

  return (
    <div className="app-container" style={accentStyle}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* ── Public routes ── */}
          <Route path="/login" element={
            !isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <Login onLogin={handleLogin} onSwitchToSignup={() => navigate('/signup')} />
              </motion.div>
            ) : <Navigate to={`/${user.role}/dashboard`} replace />
          } />

          <Route path="/signup" element={<Navigate to="/login" replace />} />

          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ── Role-prefixed protected routes ── */}
          {/* Each role gets its own URL namespace: /admin/*, /manager/*, /student/* */}
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
            {/* Dashboard — renders StudentDashboard for students, Dashboard for admin/manager */}
            <Route path="dashboard" element={<RoleDashboard />} />

            {/* All roles */}
            <Route path="menu" element={<FoodMenu />} />
            <Route path="facilities" element={<Facilities />} />

            {/* Admin + Manager only */}
            <Route path="students" element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Students />
              </ProtectedRoute>
            } />
            <Route path="payments" element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Payments />
              </ProtectedRoute>
            } />

            {/* Admin only */}
            <Route path="settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Student-only pages */}
            <Route path="room" element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyRoom />
              </ProtectedRoute>
            } />
            <Route path="fees" element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyFees />
              </ProtectedRoute>
            } />
            <Route path="complaints" element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyComplaints />
              </ProtectedRoute>
            } />
          </Route>

          {/* ── Root & fallback ── */}
          <Route path="/" element={
            isAuthenticated
              ? <Navigate to={`/${user.role}/dashboard`} replace />
              : <Navigate to="/login" replace />
          } />
          <Route path="*" element={
            isAuthenticated
              ? <Navigate to={`/${user.role}/dashboard`} replace />
              : <Navigate to="/login" replace />
          } />

        </Routes>
      </AnimatePresence>
    </div>
  );
}
