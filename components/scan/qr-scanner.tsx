"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ScanState = "idle" | "scanning" | "success" | "error";

export function QrScanner() {
  const router = useRouter();
  const regionId = "qr-reader-region";
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [scannedUrl, setScannedUrl] = useState("");

  const stop = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
  };

  const start = async () => {
    const { Html5Qrcode } = await import("html5-qrcode");
    setState("scanning");
    setErrorMsg("");

    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          stop();
          setState("success");
          setScannedUrl(decodedText);

          // Check if this is one of our card URLs: /card/{username}/{slug}
          try {
            const url = new URL(decodedText);
            const match = url.pathname.match(/^\/card\/[^/]+\/[^/]+$/);
            if (match) {
              // Navigate within the app
              router.push(url.pathname);
              return;
            }
          } catch {
            // not a valid URL — just show it
          }
        },
        () => {} // per-frame error — ignore
      );
    } catch (err: unknown) {
      setState("error");
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("permission")) {
        setErrorMsg("Camera permission denied. Please allow camera access and try again.");
      } else {
        setErrorMsg("Could not start camera. Make sure you're on HTTPS and try again.");
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => { stop(); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 px-4 pt-8 pb-28">
      {/* Viewfinder region — html5-qrcode mounts the video here */}
      <div
        id={regionId}
        className="w-full max-w-sm rounded-xl overflow-hidden border border-black/10 bg-black"
        style={{ minHeight: 300 }}
      />

      {state === "idle" && (
        <button
          onClick={start}
          className="w-full max-w-sm bg-accent text-white text-sm font-medium py-3 rounded-full"
        >
          Start scanning
        </button>
      )}

      {state === "scanning" && (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <p className="text-sm text-black/50 text-center">
            Point the camera at a Net QR code
          </p>
          <button
            onClick={() => { stop(); setState("idle"); }}
            className="w-full border border-black/20 text-sm font-medium py-3 rounded-full"
          >
            Cancel
          </button>
        </div>
      )}

      {state === "success" && (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <p className="text-sm text-black/50 text-center break-all">{scannedUrl}</p>
          <button
            onClick={() => { setState("idle"); setScannedUrl(""); }}
            className="w-full bg-accent text-white text-sm font-medium py-3 rounded-full"
          >
            Scan again
          </button>
          <a
            href={scannedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full border border-black/20 text-sm font-medium py-3 rounded-full text-center"
          >
            Open link
          </a>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <p className="text-sm text-red-500 text-center">{errorMsg}</p>
          <button
            onClick={() => { setState("idle"); setErrorMsg(""); }}
            className="w-full bg-accent text-white text-sm font-medium py-3 rounded-full"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
