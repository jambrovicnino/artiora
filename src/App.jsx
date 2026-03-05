import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import CursorEffect from './components/CursorEffect';
import HomePage from './pages/HomePage';
import StudioPage from './pages/StudioPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import ProcessPage from './pages/ProcessPage';
import GalleryPage from './pages/GalleryPage';
import TestimonialsPage from './pages/TestimonialsPage';
import './App.css';

export default function App() {
  return (
    <>
      <CursorEffect />
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/o-nas" element={<AboutPage />} />
          <Route path="/kako-deluje" element={<ProcessPage />} />
          <Route path="/galerija" element={<GalleryPage />} />
          <Route path="/mnenja" element={<TestimonialsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
