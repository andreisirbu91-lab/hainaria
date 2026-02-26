import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import { Toast } from './components/ui';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductPage from './pages/ProductPage';
import Cart from './pages/Cart';
import StudioPage from './pages/studio/StudioPage';
import StaticPage from './pages/StaticPage';
import AdminLayout from './pages/admin/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/products/ProductList';
import ProductEditor from './pages/admin/products/ProductEditor';
import HomeBuilder from './pages/admin/content-builder/HomeBuilder';
import BlockEditor from './pages/admin/content-builder/BlockEditor';
import SettingsEditor from './pages/admin/settings/SettingsEditor';
import PageManager from './pages/admin/pages/PageManager';
import PageEditor from './pages/admin/pages/PageEditor';
import Footer from './components/layout/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/p/:slug" element={<StaticPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductEditor />} />
              <Route path="products/edit/:id" element={<ProductEditor />} />
              <Route path="home-builder" element={<HomeBuilder />} />
              <Route path="home-builder/edit/:id" element={<BlockEditor />} />
              <Route path="home-builder/new/:type" element={<BlockEditor />} />
              <Route path="settings" element={<SettingsEditor />} />
              <Route path="pages" element={<PageManager />} />
              <Route path="pages/new" element={<PageEditor />} />
              <Route path="pages/edit/:id" element={<PageEditor />} />
            </Route>
          </Routes>
        </main>
        <Footer />
        <Toast />
      </div>
    </Router>
  );
}

export default App;
