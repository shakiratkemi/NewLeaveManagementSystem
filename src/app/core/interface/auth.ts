export interface Login {
  email: string;
  password: string;
}

export interface ApiLoginResponse {
  success: boolean;
  message: 'string';
  data: {
    userId: 'string';
    fullName: 'string';
    email: 'string';
    role: 'string';
    token: 'string';
    refreshToken: 'string';
    expiration: '2026-08-04T12:04:09.1501331Z';
  };
}
