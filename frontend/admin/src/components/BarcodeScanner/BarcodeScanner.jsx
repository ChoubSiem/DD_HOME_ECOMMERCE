import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export default function BarcodeScanner({ onScan }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 350 },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
      },
      (error) => {
        console.log("Scan error:", error);
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error(err));
    };
  }, [onScan]);

  return <div id="reader" style={{ width: "100%" }}></div>;
}