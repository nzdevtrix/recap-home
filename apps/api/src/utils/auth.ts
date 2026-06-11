import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@recap/database';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'recap-home-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    avatar?: string | null;
  };
}

// Generate JWT token
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Generate refresh token
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create user with validation
export async function createUser(
  email: string,
  password: string,
  name: string,
  role: string = 'PRIVATE',
  googleId?: string,
  googleImage?: string
): Promise<{ user: any; accessToken: string; refreshToken: string }> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Hash password if provided
  const hashedPassword = password ? await hashPassword(password) : null;
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      googleId,
      googleImage,
      emailVerified: !!googleId, // Google auth users are auto-verified
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      googleImage: true,
      createdAt: true,
    },
  });
  
  // Generate tokens
  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  
  return {
    user: {
      ...user,
      avatar: user.googleImage || user.avatar,
    },
    accessToken,
    refreshToken,
  };
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<TokenResponse> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      role: true,
      avatar: true,
      googleImage: true,
      isActive: true,
    },
  });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }
  
  // Google auth users don't have password
  if (!user.password) {
    throw new Error('Please use Google sign-in for this account');
  }
  
  // Compare password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  // Generate tokens
  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.googleImage || user.avatar,
    },
  };
}

// Login with Google
export async function loginWithGoogle(
  googleId: string,
  email: string,
  name: string,
  image?: string
): Promise<TokenResponse> {
  // Find or create user
  let user = await prisma.user.findUnique({
    where: { googleId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      googleImage: true,
      isActive: true,
    },
  });
  
  if (!user) {
    // Create new user with Google
    user = await prisma.user.create({
      data: {
        email,
        name,
        role: 'PRIVATE',
        googleId,
        googleImage: image,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        googleImage: true,
        isActive: true,
      },
    });
  }
  
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }
  
  // Generate tokens
  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.googleImage || user.avatar,
    },
  };
}

// Refresh token
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const payload = verifyToken(refreshToken);
  if (!payload) {
    throw new Error('Invalid refresh token');
  }
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      googleImage: true,
      isActive: true,
    },
  });
  
  if (!user || !user.isActive) {
    throw new Error('Invalid user');
  }
  
  // Generate new tokens
  const newAccessToken = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  
  const newRefreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.googleImage || user.avatar,
    },
  };
}

// Logout - invalidate session
export async function logoutUser(userId: string): Promise<void> {
  // In JWT-based auth, logout is handled client-side by removing tokens
  // For session tracking, we can delete sessions from database
  await prisma.session.deleteMany({
    where: { userId },
  });
}

// Get user by ID
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      googleImage: true,
      phone: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      rider: true,
      business: true,
      riderProfile: true,
      businessProfile: true,
    },
  });
}

// Validate user role
export function validateRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Get Google OAuth URL
export function getGoogleAuthUrl(redirectUri: string): string {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  return `${rootUrl}?${params.toString()}`;
}

// Exchange Google code for token
export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<{
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google OAuth error: ${error}`);
  }
  
  const data = await response.json();
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

// Decode Google ID token
export async function decodeGoogleIdToken(idToken: string): Promise<{
  email: string;
  name: string;
  picture?: string;
  sub: string;
}> {
  const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`);
  if (!response.ok) {
    throw new Error('Invalid Google ID token');
  }
  const data = await response.json();
  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
    sub: data.sub,
  };
}

// Middleware to extract user from token
export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) return null;
  return getUserById(payload.userId);
}
