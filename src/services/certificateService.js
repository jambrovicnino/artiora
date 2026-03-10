// ═══════════════════════════════════════════════
// ARTIORA — Certificate Service
//
// Generates certificate data objects with QR codes
// for artwork authenticity verification.
// ═══════════════════════════════════════════════

import { generateQRCode } from './qrService';

/**
 * Create a full certificate object for an artwork.
 *
 * @param {Object} artwork — artwork data (from MarketplaceContext)
 * @param {Object} artist  — artist data (from ArtistContext)
 * @param {number} editionNumber — edition number (defaults to 1)
 * @returns {Promise<Object>} — certificate object ready for context storage
 */
export async function createCertificateForArtwork(artwork, artist, editionNumber = 1) {
  const edNum = String(editionNumber).padStart(3, '0');
  const id = `cert-${artwork.id}-${edNum}`;
  const certifiedDate = new Date().toISOString();
  const verificationUrl = `/potrdilo/${id}`;

  // Generate QR code encoding the full verification URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://artiora.si';
  const fullUrl = `${origin}${verificationUrl}`;
  const qrCodeDataUrl = await generateQRCode(fullUrl, 200);

  const certificate = {
    id,
    artworkId: artwork.id,
    artworkTitle: artwork.title,
    artistId: artist?.id || artwork.artistId,
    artistName: artist?.name || 'Neznani umetnik',
    editionNumber,
    totalEditions: artwork.editionSize || artwork.totalEditions || 1,
    editionType: artwork.editionType || 'limited',
    medium: artwork.medium || '',
    dimensions: artwork.dimensions || '',
    verificationUrl,
    certifiedDate,
    status: 'active',
    ownerHistory: [
      {
        name: 'ARTIORA',
        date: certifiedDate,
        type: 'original',
      },
    ],
    qrCodeDataUrl,
  };

  return certificate;
}

/**
 * Generate a QR code data URL for an existing certificate.
 * Useful when a certificate was created without a QR code
 * (e.g., from the context reducer which cannot be async).
 *
 * @param {Object} certificate — existing certificate object
 * @param {number} size — QR image size in pixels
 * @returns {Promise<string>} — data URL (base64 PNG)
 */
export async function generateCertificateQR(certificate, size = 200) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://artiora.si';
  const fullUrl = `${origin}${certificate.verificationUrl}`;
  return generateQRCode(fullUrl, size);
}

export default {
  createCertificateForArtwork,
  generateCertificateQR,
};
