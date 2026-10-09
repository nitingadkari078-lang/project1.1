// Core types for MediVault Frontend

export interface User {
  id: string;
  email: string;
  fullName: string;
  age?: number;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hospital {
  id: string;
  hospitalId: string;
  hospitalName: string;
  city: string;
  address?: string;
  email?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'suspended' | 'closed';
  hasPrivateKey: boolean;
  hasVisitHistory: boolean;
}

// Time-limited QR share (privacy feature)
export interface QRShareToken {
  token: string;
  expiresIn: number;
  expiresAt: string;
  scope: 'read_only';
  hospitalId: string;
}

export interface QRScanResult {
  valid: boolean;
  scope: 'read_only';
  remainingSeconds: number;
  expiresAt: string;
  patientName: string;
  patientAge?: number;
  hospitalName: string;
  scannedAt: string;
}

export interface PrivateKey {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalPrivateKeyIndex: string;
  age: number;
  generatedAt: string;
  expiresAt?: string;
  isActive: boolean;
  lastUsedAt?: string;
}

export interface PatientVisit {
  id: string;
  userId: string;
  hospitalId: string;
  hospitalName: string;
  visitDate: string;
  location?: string;
  doctorName: string;
  caseName: string;
  visitNotes?: string;
  isEmergency: boolean;
  createdAt: string;
}

export interface CaseRecord {
  id: string;
  visitId: string;
  caseType: 'lab_report' | 'discharge_summary' | 'prescription' | 'notes' | 'imaging_report' | 'other';
  title: string;
  content: string;
  fileUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConsentRequest {
  id: string;
  sharingType: 'read_only' | 'read_write';
  targetHospitalId: string;
  targetHospitalName: string;
  consentDurationDays: number;
  requestedAt: string;
  approvedAt?: string;
  expiresAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  grantedScope: Record<string, string[]>;
}

export interface EmergencyAccessRequest {
  id: string;
  requestingHospitalId: string;
  requestingHospitalName: string;
  requesterName: string;
  requesterCell: string;
  reason: string;
  grantedAt: string;
  expiresAt: string;
  status: 'pending' | 'granted' | 'revoked' | 'expired';
  notifiedPatient: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface EmergencyLimitedData {
  bloodGroup: string;
  allergies: string[];
  currentMedications: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  organDonor: boolean;
  height?: string;
  weight?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  actionType: string;
  actionDescription: string;
  hospitalId?: string;
  hospitalName?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Google OAuth Tokens
export interface GoogleTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Login Response
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

// Emergency Contact View
export interface EmergencyContact {
  id: string;
  hospitalId: string;
  hospitalName: string;
  doctorName: string;
  contactNumber: string;
  email?: string;
  verified: boolean;
}

// File Upload
export interface FileUpload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  thumbnail?: string;
  uploadedAt: string;
}

// Record Sharing Scope Option
export interface RecordScopeOption {
  category: string;
  label: string;
  description: string;
  categories: string[];
}

// Notification
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// URI Query Parameters
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  hospitalId?: string;
  startDate?: string;
  endDate?: string;
}
