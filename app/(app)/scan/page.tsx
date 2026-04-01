import { QrScanner } from "@/components/scan/qr-scanner";

export default function ScanPage() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center px-4 h-14 border-b border-black/10">
        <h1 className="text-base font-semibold">Scan</h1>
      </div>
      <QrScanner />
    </div>
  );
}
