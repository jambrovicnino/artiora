import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import CursorEffect from './components/CursorEffect';
import ProtectedRoute from './components/auth/ProtectedRoute';

// ─── Existing Pages ───
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
import AdminNotifyPage from './pages/AdminNotifyPage';
import AdjustmentPage from './pages/AdjustmentPage';

// ─── Auth Pages ───
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// ─── Marketplace Pages ───
import MarketplacePage from './pages/MarketplacePage';
import ArtworkDetailPage from './pages/ArtworkDetailPage';

// ─── Artist Pages ───
import ArtistsPage from './pages/ArtistsPage';
import ArtistProfilePage from './pages/ArtistProfilePage';

// ─── Wishlist ───
import WishlistPage from './pages/WishlistPage';

// ─── Certificate ───
import CertificatePage from './pages/CertificatePage';

// ─── Dashboard & Admin ───
import DashboardPage from './pages/DashboardPage';
import UploadArtworkPage from './pages/UploadArtworkPage';
import MyArtworksPage from './pages/MyArtworksPage';
import AdminReviewPage from './pages/AdminReviewPage';

// ─── Business Plan ───
import BusinessPlanPage from './pages/BusinessPlanPage';

// ─── Commissions ───
import CommissionRequestPage from './pages/CommissionRequestPage';
import CommissionChatPage from './pages/CommissionChatPage';
import MyCommissionsPage from './pages/MyCommissionsPage';

import './App.css';

export default function App() {
  return (
    <>
      <CursorEffect />
      <ScrollToTop />
      <Navbar />
      <ErrorBoundary>
      <main>
        <Routes>
          {/* ─── Public ─── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/o-nas" element={<AboutPage />} />
          <Route path="/kako-deluje" element={<ProcessPage />} />
          <Route path="/galerija" element={<GalleryPage />} />
          <Route path="/mnenja" element={<TestimonialsPage />} />
          <Route path="/admin/notify" element={<AdminNotifyPage />} />
          <Route path="/prilagoditev" element={<AdjustmentPage />} />

          {/* ─── Auth ─── */}
          <Route path="/prijava" element={<LoginPage />} />
          <Route path="/registracija" element={<RegisterPage />} />

          {/* ─── Marketplace ─── */}
          <Route path="/artmarket" element={<MarketplacePage />} />
          <Route path="/artmarket/:artworkId" element={<ArtworkDetailPage />} />

          {/* ─── Artists ─── */}
          <Route path="/umetniki" element={<ArtistsPage />} />
          <Route path="/umetnik/:artistId" element={<ArtistProfilePage />} />

          {/* ─── Wishlist ─── */}
          <Route path="/priljubljene" element={<WishlistPage />} />

          {/* ─── Certificate ─── */}
          <Route path="/potrdilo/:certificateId" element={<CertificatePage />} />

          {/* ─── Business Plan ─── */}
          <Route path="/poslovni-načrt" element={<BusinessPlanPage />} />
          <Route path="/poslovni-načrt/:section" element={<BusinessPlanPage />} />

          {/* ─── Commissions ─── */}
          <Route path="/naroci-delo/:artistId" element={<CommissionRequestPage />} />
          <Route path="/naroci-delo/pogovor/:commissionId" element={<CommissionChatPage />} />

          {/* ─── Dashboard (Protected) ─── */}
          <Route path="/nadzorna-plosca" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/nadzorna-plosca/nalozi" element={<ProtectedRoute requireArtist><UploadArtworkPage /></ProtectedRoute>} />
          <Route path="/nadzorna-plosca/umetnine" element={<ProtectedRoute requireArtist><MyArtworksPage /></ProtectedRoute>} />
          <Route path="/nadzorna-plosca/narocila" element={<ProtectedRoute><MyCommissionsPage /></ProtectedRoute>} />

          {/* ─── Admin (Protected, role='admin') ─── */}
          <Route path="/admin/pregled" element={<ProtectedRoute role="admin"><AdminReviewPage /></ProtectedRoute>} />

          {/* ─── 404 ─── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      </ErrorBoundary>
    </>
  );
}
