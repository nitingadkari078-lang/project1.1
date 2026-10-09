import React, { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import {
  QrCode, Camera, X, ShieldCheck, Clock, AlertTriangle, CheckCircle, RefreshCw,
} from 'lucide-react';
import { hospitalApi, qrApi } from '../utils/api';
import type { Hospital, QRScanResult } from '../types';

const TTL_OPTIONS = [
  { seconds: 30, label: '30s' },
  { seconds: 60, label: '1 min' },
  { seconds: 120, label: '2 min' },
  { seconds: 300, label: '5 min (max)' },
];

function formatMMSS(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function QRSharePage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [ttl, setTtl] = useState(60);

  // Generated QR state
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number>(0); // epoch ms
  const [remaining, setRemaining] = useState(0);
  const [generating, setGenerating] = useState(false);

  // Scanner state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);

  useEffect(() => {
    hospitalApi.list().then(list => {
      setHospitals(list);
      if (list.length > 0) setSelectedHospitalId(prev => prev || list[0].hospitalId);
    });
  }, []);

  // Countdown for the QR expiry
  useEffect(() => {
    if (!qrToken) return;
    const tick = () => {
      const secs = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemaining(secs);
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [qrToken, expiresAt]);

  const expired = !!qrToken && remaining <= 0;

  const handleGenerate = async () => {
    if (!selectedHospitalId) return;
    setGenerating(true);
    try {
      const token = await qrApi.generate(selectedHospitalId, ttl);
      setQrToken(token.token);
      setExpiresAt(Date.parse(token.expiresAt));
    } catch (e: any) {
      setScanError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleInvalidate = () => {
    setQrToken(null);
    setRemaining(0);
  };

  // --- Camera scanning -----------------------------------------------------
  const stopCamera = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  useEffect(() => () => stopCamera(), []);

  const verifyToken = async (text: string) => {
    stopCamera();
    setScanError(null);
    setScanResult(null);
    try {
      const result = await qrApi.scan(text, hospitals);
      setScanResult(result);
    } catch (e: any) {
      setScanError(e.message || 'QR token rejected');
    }
  };

  const tickScan = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          void verifyToken(code.data);
          return; // stop the loop (camera shut down inside verifyToken)
        }
      }
    }
    rafRef.current = requestAnimationFrame(tickScan);
  };

  const startScanning = async () => {
    setScanError(null);
    setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setScanning(true);
      // Wait a beat for the <video> to mount, then start decoding
      setTimeout(() => {
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        void video.play();
        rafRef.current = requestAnimationFrame(tickScan);
      }, 100);
    } catch (e: any) {
      setScanError('Camera unavailable: ' + (e.message || 'permission denied'));
    }
  };

  const selectedHospital = hospitals.find(h => h.hospitalId === selectedHospitalId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">QR Share</h1>
        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Short-lived, read-only consent. The QR expires automatically (max 5 minutes) and every
          event is audit-logged. A QR is never a login credential.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ---------------- Generate side ---------------- */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" /> Show my QR to a hospital
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Hospital</label>
              <select
                value={selectedHospitalId}
                onChange={e => setSelectedHospitalId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.hospitalId}>
                    {h.hospitalName} ({h.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Auto-expires after
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TTL_OPTIONS.map(opt => (
                  <button
                    key={opt.seconds}
                    type="button"
                    onClick={() => setTtl(opt.seconds)}
                    className={`py-2 text-sm font-medium rounded-lg border transition-all ${
                      ttl === opt.seconds
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!qrToken ? (
            <button
              onClick={handleGenerate}
              disabled={generating || !selectedHospitalId}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {generating ? 'Generating…' : 'Generate time-limited QR'}
            </button>
          ) : (
            <div className="text-center">
              <div className="relative inline-block">
                <div className={`p-4 bg-white rounded-2xl border-2 transition-colors ${expired ? 'border-red-300 opacity-40' : 'border-blue-200'}`}>
                  <QRCodeSVG value={qrToken} size={200} level="M" />
                </div>
                {expired && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-lg shadow">
                      EXPIRED
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <Clock className={`w-5 h-5 ${remaining <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
                <span className={`text-2xl font-mono font-bold ${remaining <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatMMSS(remaining)}
                </span>
                <span className="text-xs text-gray-500">until auto-expiry</span>
              </div>

              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${remaining <= 10 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${(remaining / ttl) * 100}%` }}
                />
              </div>

              <button
                onClick={handleInvalidate}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                <X className="w-4 h-4" /> Invalidate now
              </button>
              <p className="text-[11px] text-gray-400 mt-3">
                Scope: read-only · {selectedHospital?.hospitalName}
              </p>
            </div>
          )}
        </div>

        {/* ---------------- Scan side ---------------- */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" /> Scan a patient's QR (hospital staff)
          </h2>

          <div className="rounded-xl overflow-hidden bg-black relative aspect-video mb-4">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${scanning ? '' : 'hidden'}`}
            />
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <Camera className="w-10 h-10 mb-2" />
                <span className="text-sm">Camera is off</span>
              </div>
            )}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none border-2 border-emerald-400/70 rounded-xl m-6" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {!scanning ? (
            <button
              onClick={startScanning}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" /> Start camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-black transition-colors inline-flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Stop camera
            </button>
          )}

          {scanError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {scanResult && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-emerald-900">Valid — read-only access granted</span>
              </div>
              <dl className="text-sm space-y-1 text-gray-700">
                <div className="flex justify-between"><dt className="text-gray-500">Patient</dt><dd className="font-semibold">{scanResult.patientName}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">At hospital</dt><dd>{scanResult.hospitalName}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Access expires in</dt><dd className="font-mono font-bold">{formatMMSS(scanResult.remainingSeconds)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Scope</dt><dd>Read-only records</dd></div>
              </dl>
              <button
                onClick={() => setScanResult(null)}
                className="mt-3 text-xs font-semibold text-emerald-700 inline-flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-3 h-3" /> Scan another
              </button>
            </div>
          )}

          <p className="text-[11px] text-gray-400 mt-4">
            Scans are audit-logged. Access ends automatically when the timer above runs out.
          </p>
        </div>
      </div>
    </div>
  );
}
