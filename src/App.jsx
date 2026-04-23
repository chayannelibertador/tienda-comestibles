import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ProductsProvider } from './context/ProductsContext';
import { OrdersProvider } from './context/OrdersContext';
import { TestimonialsProvider } from './context/TestimonialsContext';
import { ToastProvider } from './context/ToastContext';
import { SettingsProvider } from './context/SettingsContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

import LayoutMain from './components/layout/LayoutMain';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';

// Rutas Críticas que cargan del bundle inicial
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import MyOrders from './pages/MyOrders';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import Contact from './pages/Contact';

import './App.css';

// Rutas Pesadas / Flujos Secundarios cargadas perezosamente (Code Splitting)
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminTestimonials = lazy(() => import('./pages/AdminTestimonials'));
const AdminFailedSearches = lazy(() => import('./pages/AdminFailedSearches'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));

function App() {
  return (
    <GoogleOAuthProvider clientId="1041953400322-l9vs071fe7a59fberjhk4khlves35ma1.apps.googleusercontent.com">
      <ToastProvider>
        <UserProvider>
        <SettingsProvider>
          <ProductsProvider>
            <FavoritesProvider>
              <Router>
                <ScrollToTop />
                <CartProvider>
                  <OrdersProvider>
                    <TestimonialsProvider>
                      <LayoutMain>
                        <Suspense fallback={
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                            <div className="spinner"></div> {/* Asume que hay un spinner en CSS general */}
                          </div>
                        }>
                          <Routes>
                            <Route path="/" element={<Home />} />
                          <Route path="/catalog" element={<Catalog />} />
                          <Route path="/favorites" element={<Favorites />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                          <Route path="/my-orders" element={<MyOrders />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/privacy" element={<PrivacyPolicy />} />
                          <Route path="/terms" element={<TermsAndConditions />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/admin/login" element={<AdminLogin />} />
                          <Route
                            path="/admin"
                            element={
                              <ProtectedRoute>
                                <Admin />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/products"
                            element={
                              <ProtectedRoute>
                                <AdminProducts />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/orders"
                            element={
                              <ProtectedRoute>
                                <AdminOrders />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/settings"
                            element={
                              <ProtectedRoute>
                                <AdminSettings />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/testimonials"
                            element={
                              <ProtectedRoute>
                                <AdminTestimonials />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/failed-searches"
                            element={
                              <ProtectedRoute>
                                <AdminFailedSearches />
                              </ProtectedRoute>
                            }
                          />
                        </Routes>
                        </Suspense>
                      </LayoutMain>
                    </TestimonialsProvider>
                  </OrdersProvider>
                </CartProvider>
              </Router>
            </FavoritesProvider>
          </ProductsProvider>
        </SettingsProvider>
      </UserProvider>
    </ToastProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
