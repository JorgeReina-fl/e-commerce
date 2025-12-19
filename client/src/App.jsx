import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useCart } from './context/CartContext';

// Lazy load pages for code splitting
const ProductList = lazy(() => import('./components/ProductList'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const SharedWishlistPage = lazy(() => import('./pages/SharedWishlistPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
  </div>
);

// Wrapper to access cart count in Navbar
const AppContent = () => {
  const { getCartCount } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col print:block print:h-auto transition-colors">
      <Navbar cartCount={getCartCount()} />
      <div className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/search/:keyword" element={<ProductList />} />
            <Route path="/page/:pageNumber" element={<ProductList />} />
            <Route path="/search/:keyword/page/:pageNumber" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/order/:id" element={<OrderDetailsPage />} />
            <Route path="/track-order" element={<OrderTrackingPage />} />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationCenter />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route path="/wishlist/shared/:token" element={<SharedWishlistPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <SocketProvider>
              <CartProvider>
                <WishlistProvider>
                  <NotificationProvider>
                    <Toaster position="top-right" />
                    <AppContent />
                  </NotificationProvider>
                </WishlistProvider>
              </CartProvider>
            </SocketProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;


