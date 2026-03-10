import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ArtistProvider } from './context/ArtistContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { CommissionProvider } from './context/CommissionContext';
import { CertificateProvider } from './context/CertificateContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { seedMockData } from './services/mockDataService';
import App from './App';

// Seed localStorage with demo data on first visit
seedMockData();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ArtistProvider>
          <MarketplaceProvider>
            <CommissionProvider>
              <CertificateProvider>
                <WishlistProvider>
                  <CartProvider>
                    <App />
                  </CartProvider>
                </WishlistProvider>
              </CertificateProvider>
            </CommissionProvider>
          </MarketplaceProvider>
        </ArtistProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
