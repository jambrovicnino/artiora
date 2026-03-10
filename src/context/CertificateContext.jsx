import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const CertificateContext = createContext();

const STORAGE_KEY = 'artiora_certificates';

function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.certificates) return parsed;
    }
    return { certificates: [] };
  } catch {
    return { certificates: [] };
  }
}

function certificateReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };

    case 'GENERATE_CERTIFICATE': {
      const {
        artworkId,
        artworkTitle,
        artistId,
        artistName,
        editionNumber,
        totalEditions,
        editionType,
        medium,
        dimensions,
      } = action.payload;

      const edNum = String(editionNumber || 1).padStart(3, '0');
      const id = `cert-${artworkId}-${edNum}`;
      const certifiedDate = new Date().toISOString();

      const certificate = {
        id,
        artworkId,
        artworkTitle,
        artistId,
        artistName,
        editionNumber: editionNumber || 1,
        totalEditions: totalEditions || 1,
        editionType: editionType || 'limited',
        medium: medium || '',
        dimensions: dimensions || '',
        verificationUrl: `/potrdilo/${id}`,
        certifiedDate,
        status: 'active',
        ownerHistory: [
          { name: 'ARTIORA', date: certifiedDate, type: 'original' },
        ],
        qrCodeDataUrl: '',
      };

      return {
        ...state,
        certificates: [...state.certificates, certificate],
      };
    }

    case 'TRANSFER_CERTIFICATE':
      return {
        ...state,
        certificates: state.certificates.map((c) =>
          c.id === action.payload.certId
            ? {
                ...c,
                ownerHistory: [
                  ...(c.ownerHistory || []),
                  {
                    name: action.payload.newOwnerName,
                    date: new Date().toISOString(),
                    type: 'transfer',
                  },
                ],
              }
            : c
        ),
      };

    default:
      return state;
  }
}

export function CertificateProvider({ children }) {
  const [state, dispatch] = useReducer(certificateReducer, null, loadData);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn(
        '[ARTIORA] localStorage poln, ne morem shraniti certificates:',
        e.message
      );
    }
  }, [state]);

  const getCertificate = useCallback(
    (id) => state.certificates.find((c) => c.id === id) || null,
    [state.certificates]
  );

  const getCertificatesByArtwork = useCallback(
    (artworkId) =>
      state.certificates.filter((c) => c.artworkId === artworkId),
    [state.certificates]
  );

  const generateCertificate = useCallback((data) => {
    dispatch({ type: 'GENERATE_CERTIFICATE', payload: data });
  }, []);

  const transferCertificate = useCallback((certId, newOwnerName) => {
    dispatch({
      type: 'TRANSFER_CERTIFICATE',
      payload: { certId, newOwnerName },
    });
  }, []);

  return (
    <CertificateContext.Provider
      value={{
        certificates: state.certificates,
        getCertificate,
        getCertificatesByArtwork,
        generateCertificate,
        transferCertificate,
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCertificates() {
  const ctx = useContext(CertificateContext);
  if (!ctx)
    throw new Error('useCertificates must be used within CertificateProvider');
  return ctx;
}
