import express from 'express';
import {
  createUser,
  loginUser,
  loginWithGoogle,
  refreshAccessToken,
  logoutUser,
  getUserById,
  exchangeGoogleCode,
  decodeGoogleIdToken,
  getGoogleAuthUrl,
} from '../utils/auth';
import { UserRole, RiderApprovalStatus, BusinessStatus } from '@prisma/client';
import { prisma } from '@recap/database';

const router = express.Router();

// Google OAuth - Get auth URL
router.get('/google/url', (req, res) => {
  try {
    const redirectUri = req.query.redirect_uri as string || 'http://localhost:3000/auth/callback';
    const url = getGoogleAuthUrl(redirectUri);
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Google OAuth - Exchange code for tokens
router.post('/google/exchange', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;
    if (!code || !redirectUri) {
      return res.status(400).json({ error: 'Code and redirectUri are required' });
    }
    
    const googleTokens = await exchangeGoogleCode(code, redirectUri);
    const googleUser = await decodeGoogleIdToken(googleTokens.idToken);
    
    const { accessToken, refreshToken, user } = await loginWithGoogle(
      googleUser.sub,
      googleUser.email,
      googleUser.name,
      googleUser.picture
    );
    
    res.json({ accessToken, refreshToken, user, googleTokens });
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register new user (Email/Password)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, phone, regionId } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Email, password, and name are required' 
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters' 
      });
    }
    
    const userRole = role as UserRole || UserRole.PRIVATE;
    
    const { user, accessToken, refreshToken } = await createUser(
      email,
      password,
      name,
      userRole
    );
    
    if (userRole === UserRole.RIDER) {
      await prisma.riderProfile.create({
        data: {
          userId: user.id,
          regionId: regionId || (await prisma.region.findFirst())?.id,
          approvalStatus: RiderApprovalStatus.PENDING,
          backgroundCheckStatus: 'PENDING',
        },
      });
      
      await prisma.rider.create({
        data: {
          userId: user.id,
          regionId: regionId || (await prisma.region.findFirst())?.id,
        },
      });
    }
    
    if (userRole === UserRole.BUSINESS) {
      await prisma.businessProfile.create({
        data: {
          userId: user.id,
          name: name,
          address: '',
          regionId: regionId || (await prisma.region.findFirst())?.id,
          status: BusinessStatus.ACTIVE,
          approvedAt: new Date(),
        },
      });
      
      await prisma.business.create({
        data: {
          userId: user.id,
          name: name,
          address: '',
          regionId: regionId || (await prisma.region.findFirst())?.id,
        },
      });
    }
    
    res.status(201).json({ 
      user, 
      accessToken, 
      refreshToken,
      message: userRole === UserRole.RIDER 
        ? 'Registration successful! Your rider application is pending admin approval.'
        : 'Registration successful!'
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login user (Email/Password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const { accessToken, refreshToken, user } = await loginUser(email, password);
    res.json({ accessToken, refreshToken, user });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    const { accessToken, refreshToken: newRefreshToken, user } = await refreshAccessToken(refreshToken);
    res.json({ accessToken, refreshToken: newRefreshToken, user });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId) {
      await logoutUser(userId);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user (protected route)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }
    
    const user = await getUserById(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    let profileData = {};
    
    if (user.role === UserRole.RIDER && user.riderProfile) {
      profileData = {
        riderProfile: user.riderProfile,
        isApproved: user.riderProfile.approvalStatus === RiderApprovalStatus.APPROVED,
      };
    }
    
    if (user.role === UserRole.BUSINESS && user.businessProfile) {
      profileData = {
        businessProfile: user.businessProfile,
        isActive: user.businessProfile.status === BusinessStatus.ACTIVE,
      };
    }
    
    res.json({
      user: {
        ...user,
        avatar: user.googleImage || user.avatar,
      },
      ...profileData,
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    const user = await prisma.user.findFirst({
      where: { emailToken: token },
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailToken: null,
      },
    });
    
    res.json({ message: 'Email verified successfully' });
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return res.json({ 
        message: 'If an account exists with this email, a reset link has been sent' 
      });
    }
    
    res.json({ 
      message: 'If an account exists with this email, a reset link has been sent' 
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters' 
      });
    }
    
    const user = await prisma.user.findFirst({
      where: { emailToken: token },
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }
    
    const { hashPassword } = await import('../utils/auth');
    const hashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailToken: null,
      },
    });
    
    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
