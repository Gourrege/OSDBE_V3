export interface AuthDriver {
  driverId: string;
  email: string;
  role: 'viewer' | 'creator' | 'admin';
}
