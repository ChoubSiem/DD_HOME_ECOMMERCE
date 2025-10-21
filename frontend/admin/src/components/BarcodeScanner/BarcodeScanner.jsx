import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export default function BarcodeScanner({ onScan }) {
  useEffect(() => {
    // 1️⃣ Create scanner and attach it to a div with ID "reader"
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10, // scan 10 frames per second
        qrbox: 500 // scanning box size
      },
      false
    );

    // 2️⃣ Start scanning
    scanner.render(
      (decodedText) => {
        // This runs when a barcode or QR code is successfully scanned
        onScan(decodedText);
        // scanner.clear(); // stop scanning after first scan (optional)
      },
      (error) => {
        // This runs when scanning fails (not a big issue — it tries again)
        console.log("Scan error:", error);
      }
    );

    // 3️⃣ Cleanup when component unmounts
    return () => {
      scanner.clear().catch(err => console.error(err));
    };
  }, [onScan]);

  return <div id="reader" style={{ width: "100%" }}></div>;
}
