import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import { Toast } from './components/ui';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductPage from './pages/ProductPage';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import StudioPage from './pages/studio/StudioPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/studio" element={<StudioPage />} />
          </Routes>
        </main>
        <Toast />
      </div>
    </Router>
  );
}

export default App;
