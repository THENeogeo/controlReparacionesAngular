export interface JwtRequest {
  username: string;
  password: string;
}

export interface JwtResponse {
  token: string;
}