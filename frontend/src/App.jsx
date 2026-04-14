import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import GlobalSidebar from './components/GlobalSidebar';
import MarketplaceNavbar from './components/MarketplaceNavbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import ProductDetail from './pages/ProductDetail';

function MainLayout({ children }) {
  return (
    <div className="flex h-[100dvh] w-full font-body bg-surface overflow-hidden relative">
      <GlobalSidebar />
      <div className="flex-1 overflow-y-auto relative h-full">
        {children}
      </div>
    </div>
  );
}

function MarketplaceLayout({ children }) {
  return (
    <div className="min-h-full w-full flex flex-col relative bg-surface">
      <MarketplaceNavbar />
      <main className="flex-1 w-full flex flex-col pt-20 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children, isMarketplace = false }) {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface font-bold tracking-widest uppercase text-xs">Loading Sector</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If this route is a marketplace route, wrap that inner layer with MarketplaceLayout
  const content = isMarketplace ? <MarketplaceLayout>{children}</MarketplaceLayout> : children;

  // We wrap everything in MainLayout
  return <MainLayout>{content}</MainLayout>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/bus" replace />} />
          <Route 
            path="/bus" 
            element={
              <ProtectedRoute isMarketplace={false}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marketplace" 
            element={
              <ProtectedRoute isMarketplace={true}>
                <Marketplace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/product/:id" 
            element={
              <ProtectedRoute isMarketplace={true}>
                <ProductDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute isMarketplace={true}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute isMarketplace={true}>
                <Chat />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;