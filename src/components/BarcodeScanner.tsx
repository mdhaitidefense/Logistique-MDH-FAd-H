import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onResult: (decodedText: string) => void;
  onError?: (error: any) => void;
}

export const BarcodeScanner = ({ onResult, onError }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Prevent double initialization
    if (scannerRef.current) return;

    // Create instance
    const scanner = new Html5QrcodeScanner(
      "html5qr-code-full-region",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    scannerRef.current = scanner;

    // Start scanner
    scanner.render(onResult, onError || console.error);

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        scannerRef.current = null;
      }
    };
  }, []); // Only run once on mount

  return (
    <div className="w-full mx-auto" id="barcode-scanner-container">
      {/* html5-qrcode will render inside this div */}
      <div id="html5qr-code-full-region" className="rounded-xl overflow-hidden border border-slate-200"></div>
    </div>
  );
};
