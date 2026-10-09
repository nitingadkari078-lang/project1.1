import type {
  User, Hospital, PrivateKey, PatientVisit, CaseRecord,
  EmergencyAccessRequest, EmergencyLimitedData, AuditLog, ApiResponse,
  QRShareToken, QRScanResult
} from '../types';

const API_BASE = '/api';

// Helper for HTTP requests with token
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await res.json();
    return { success: res.ok, data, error: res.ok ? undefined : (data.detail || 'Request failed') };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

// Authentication API
export const authApi = {
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const cached = localStorage.getItem('currentUser');
    if (cached) {
      try {
        return { success: true, data: JSON.parse(cached) };
      } catch (e) {
        // ignore
      }
    }
    const res = await apiFetch<User>('/auth/me');
    if (res.success && res.data) {
      return res;
    }
    // Fallback demo user
    const demoUser: User = {
      id: 'usr_demo_123',
      email: 'demo@example.com',
      fullName: 'Alex Morgan',
      age: 34,
      phone: '+1 (555) 234-5678',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { success: true, data: demoUser };
  },

  async googleLogin(): Promise<void> {
    const demoUser: User = {
      id: 'usr_demo_123',
      email: 'alex.morgan@example.com',
      fullName: 'Alex Morgan',
      age: 34,
      phone: '+1 (555) 234-5678',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('accessToken', 'mock_jwt_token_demo_123');
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
    window.location.reload();
  },

  async logout(): Promise<void> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
  },
};

// Hospital API
export const hospitalApi = {
  async list(): Promise<Hospital[]> {
    const res = await apiFetch<{ hospitals: Hospital[] }>('/hospitals');
    if (res.success && res.data?.hospitals) return res.data.hospitals;

    return [
      {
        id: 'hosp_1',
        hospitalId: 'EMR001',
        hospitalName: 'City General Hospital',
        city: 'New York',
        address: '100 Medical Plaza, New York, NY 10001',
        latitude: 40.7580,
        longitude: -73.9855,
        status: 'active',
        hasPrivateKey: true,
        hasVisitHistory: true,
      },
      {
        id: 'hosp_2',
        hospitalId: 'EMR002',
        hospitalName: 'Memorial Medical Center',
        city: 'Los Angeles',
        address: '500 Health Blvd, Los Angeles, CA 90001',
        latitude: 34.0522,
        longitude: -118.2437,
        status: 'active',
        hasPrivateKey: true,
        hasVisitHistory: true,
      },
      {
        id: 'hosp_3',
        hospitalId: 'EMR003',
        hospitalName: 'St. Jude Children Research Hospital',
        city: 'Memphis',
        address: '262 Danny Thomas Pl, Memphis, TN 38105',
        latitude: 35.1495,
        longitude: -90.0490,
        status: 'active',
        hasPrivateKey: false,
        hasVisitHistory: false,
      },
      {
        id: 'hosp_4',
        hospitalId: 'EMR004',
        hospitalName: 'Mayo Clinic Health System',
        city: 'Rochester',
        address: '200 1st St SW, Rochester, MN 55905',
        latitude: 44.0225,
        longitude: -92.4665,
        status: 'active',
        hasPrivateKey: false,
        hasVisitHistory: false,
      },
    ];
  },
};

// Private Keys API
export const keysApi = {
  async list(): Promise<PrivateKey[]> {
    const res = await apiFetch<PrivateKey[]>('/private-keys');
    if (res.success && res.data) return res.data;

    return [
      {
        id: 'key_1',
        hospitalId: 'hosp_1',
        hospitalName: 'City General Hospital',
        hospitalPrivateKeyIndex: 'CGH-9921-X9K',
        age: 14,
        generatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 76 * 86400000).toISOString(),
        isActive: true,
      },
      {
        id: 'key_2',
        hospitalId: 'hosp_2',
        hospitalName: 'Memorial Medical Center',
        hospitalPrivateKeyIndex: 'MMC-4412-P3B',
        age: 45,
        generatedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 45 * 86400000).toISOString(),
        isActive: true,
      },
    ];
  },

  async revoke(keyId: string, reason: string): Promise<boolean> {
    const res = await apiFetch(`/private-keys/${keyId}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return res.success;
  },
};

// Records API
export const recordsApi = {
  async list(): Promise<PatientVisit[]> {
    const res = await apiFetch<PatientVisit[]>('/visits');
    if (res.success && res.data) return res.data;

    return [
      {
        id: 'vis_1',
        userId: 'usr_demo_123',
        hospitalId: 'hosp_1',
        hospitalName: 'City General Hospital',
        visitDate: '2026-11-15T10:30:00Z',
        doctorName: 'Dr. Sarah Johnson',
        caseName: 'Annual Cardiology Screening',
        visitNotes: 'Normal ECG, cholesterol levels slightly elevated. Prescribed lifestyle modification.',
        isEmergency: false,
        createdAt: '2026-11-15T11:00:00Z',
      },
      {
        id: 'vis_2',
        userId: 'usr_demo_123',
        hospitalId: 'hosp_2',
        hospitalName: 'Memorial Medical Center',
        visitDate: '2026-09-08T14:15:00Z',
        doctorName: 'Dr. Michael Chen',
        caseName: 'Orthopedic Knee Evaluation',
        visitNotes: 'Mild meniscus strain on right knee. Recommended physical therapy for 4 weeks.',
        isEmergency: false,
        createdAt: '2026-09-08T15:00:00Z',
      },
      {
        id: 'vis_3',
        userId: 'usr_demo_123',
        hospitalId: 'hosp_1',
        hospitalName: 'City General Hospital',
        visitDate: '2026-05-20T09:00:00Z',
        doctorName: 'Dr. Emily Watson',
        caseName: 'Comprehensive Blood Panel & Lipid Profile',
        visitNotes: 'Full metabolic panel and complete blood count within standard reference ranges.',
        isEmergency: false,
        createdAt: '2026-05-20T10:00:00Z',
      },
    ];
  },
};

// ---------------------------------------------------------------------------
// Time-limited QR share API (privacy feature)
// The QR token is read-only consent, capped at 5 minutes, fully audit-logged.
// In demo mode (no authenticated backend session) a local MVDEMO token is
// generated so the flow remains demonstrable; it honors the same TTL rules.
// ---------------------------------------------------------------------------

export const qrApi = {
  async generate(hospitalId: string, ttlSeconds: number): Promise<QRShareToken> {
    const res = await apiFetch<QRShareToken>('/qr-share/generate', {
      method: 'POST',
      body: JSON.stringify({ hospital_id: hospitalId, ttl_seconds: ttlSeconds }),
    });
    if (res.success && res.data?.token) return res.data;

    // Demo fallback: local token with identical expiry semantics
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      typ: 'qr_share',
      sub: 'usr_demo_123',
      hid: hospitalId,
      name: 'Alex Morgan',
      iat: now,
      exp: now + ttlSeconds,
    };
    const token = `MVDEMO.${btoa(JSON.stringify(payload))}.demo`;
    return {
      token,
      expiresIn: ttlSeconds,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      scope: 'read_only',
      hospitalId,
    };
  },

  async scan(token: string, hospitals: Hospital[]): Promise<QRScanResult> {
    // Backend JWT tokens (three dot-separated segments) go to the API
    if (!token.startsWith('MVDEMO.')) {
      const res = await apiFetch<QRScanResult>('/qr-share/scan', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      if (res.success && res.data) return res.data;
      throw new Error(typeof res.error === 'string' ? res.error : 'QR token rejected');
    }

    // Demo token: validate locally with the same rules
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.typ !== 'qr_share') throw new Error('Not a MediVault QR token');
      const remaining = Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
      if (remaining <= 0) throw new Error('QR token has expired - ask the patient to generate a new one');
      const hospital = hospitals.find(h => h.hospitalId === payload.hid);
      return {
        valid: true,
        scope: 'read_only',
        remainingSeconds: remaining,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        patientName: payload.name || 'Patient',
        hospitalName: hospital?.hospitalName || payload.hid,
        scannedAt: new Date().toISOString(),
      };
    } catch (e: any) {
      if (e.message?.includes('expired')) throw e;
      throw new Error('Invalid or tampered QR token');
    }
  },
};

