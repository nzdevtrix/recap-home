import express from 'express';
import { prisma } from '@recap/database';
import { hashPassword, generateToken, generateRefreshToken } from '../utils/auth';
import { generateOtp, storeOtp, verifyOtp, sendOtpEmail } from '../utils/email';

const router = express.Router();

// POST /register/business - Full Italian business registration
router.post('/business', async (req, res) => {
  try {
    const {
      // Login credentials
      username, email, password,
      // Business info
      legalName, legalType, vatId, businessCategory, businessAddress,
      city, postalCode, phone,
      // Legal representative
      ownerFullName, ownerDob, ownerPlaceOfBirth, ownerCodiceFiscale,
      ownerResidence, pecAddress,
      // Banking
      iban, bicSwift, accountHolderName, bankName, bankProofDoc
    } = req.body;

    // Validate required fields
    if (!email || !password || !legalName || !vatId || !ownerFullName) {
      return res.status(400).json({
        error: 'Required fields missing: email, password, legalName, vatId, ownerFullName'
      });
    }

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Get default region
    const region = await prisma.region.findFirst();
    if (!region) {
      return res.status(500).json({ error: 'No region configured. Contact admin.' });
    }

    // Create user with BUSINESS role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username || email.split('@')[0],
        name: legalName,
        role: "BUSINESS",
        phone,
      }
    });

    // Create business profile with all Italian fields
    await prisma.businessProfile.create({
      data: {
        userId: user.id,
        legalName,
        legalType: legalType || "INDIVIDUALE",
        ownerFullName,
        ownerDob: new Date(ownerDob),
        ownerPlaceOfBirth,
        ownerCodiceFiscale,
        ownerResidence,
        pecAddress: pecAddress || null,
        vatId,
        businessCategory: businessCategory || "ALTRO",
        businessAddress,
        city: city || null,
        postalCode: postalCode || null,
        phone: phone || null,
        status: "PENDING_BANKING",
        regionId: region.id,
      }
    });

    // Save banking info (pending verification)
    await prisma.bankingInfo.create({
      data: {
        userId: user.id,
        iban,
        bicSwift,
        accountHolder: accountHolderName || ownerFullName,
        bankName: bankName || null,
        bankProofDoc: bankProofDoc || null,
        isVerified: false,
      }
    });

    const accessToken = generateToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role, name: user.name });

    res.status(201).json({
      message: 'Business registration submitted successfully!',
      userId: user.id,
      status: 'PENDING_BANKING',
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Business registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /register/private - Private user registration
router.post('/private', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!email || !password || !firstName) {
      return res.status(400).json({ error: 'Email, password, and first name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username || email.split('@')[0],
        firstName,
        lastName: lastName || null,
        name: `${firstName} ${lastName || ''}`.trim(),
        role: "PRIVATE",
      }
    });

    const accessToken = generateToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role, name: user.name });

    res.status(201).json({
      message: 'Registration successful!',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Private registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /register/rider - Rider application
router.post('/rider', async (req, res) => {
  try {
    const {
      // Contact email
      email,
      // Personal details
      fullName, dateOfBirth, placeOfBirth, nationality, codiceFiscale,
      hasBusiness, vatId,
      residenceAddress, domicileAddress, desiredWorkCity,
      // Documents (URLs after upload)
      identityFrontUrl, identityBackUrl,
      permessoDiSoggiornoUrl, tesseraSanitariaUrl,
      // Banking
      iban, bicSwift, accountHolderName, bankName, bankProofDoc
    } = req.body;

    if (!email || !fullName || !dateOfBirth || !codiceFiscale || !residenceAddress || !desiredWorkCity) {
      return res.status(400).json({
        error: 'Required fields missing: email, fullName, dateOfBirth, codiceFiscale, residenceAddress, desiredWorkCity'
      });
    }

    // Validate nationality-based document requirements
    const isItalian = nationality?.toLowerCase() === 'italiana' || nationality?.toLowerCase() === 'italian';
    if (!isItalian && !permessoDiSoggiornoUrl) {
      return res.status(400).json({
        error: 'Permesso di Soggiorno is required for non-Italian citizens'
      });
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Get default region (will be assigned by admin later)
    const region = await prisma.region.findFirst();
    if (!region) {
      return res.status(500).json({ error: 'No region configured' });
    }

    // Create user (no password - OTP based access)
    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        role: "RIDER",
        isActive: false, // Inactive until approved
      }
    });

    // Create rider profile with all application data
    await prisma.riderProfile.create({
      data: {
        userId: user.id,
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        placeOfBirth,
        nationality: nationality || 'Italiana',
        codiceFiscale,
        residenceAddress,
        domicileAddress: domicileAddress || null,
        desiredWorkCity,
        hasBusiness: hasBusiness === true,
        vatId: vatId || null,
        hasPermessoDiSoggiorno: !isItalian,
        approvalStatus: "PENDING",
        regionId: region.id,
      }
    });

    // Save documents
    const documents: { userId: string; type: any; url: string }[] = [];
    if (identityFrontUrl) documents.push({ userId: user.id, type: 'IDENTITY_FRONT', url: identityFrontUrl });
    if (identityBackUrl) documents.push({ userId: user.id, type: 'IDENTITY_BACK', url: identityBackUrl });
    if (permessoDiSoggiornoUrl) documents.push({ userId: user.id, type: 'PERMESSO_SOGGIORNO', url: permessoDiSoggiornoUrl });
    if (tesseraSanitariaUrl) documents.push({ userId: user.id, type: 'TESSERA_SANITARIA', url: tesseraSanitariaUrl });

    if (documents.length > 0) {
      await prisma.document.createMany({ data: documents });
    }

    // Save banking info
    if (iban) {
      await prisma.bankingInfo.create({
        data: {
          userId: user.id,
          iban,
          bicSwift: bicSwift || '',
          accountHolder: accountHolderName || fullName,
          bankName: bankName || null,
          bankProofDoc: bankProofDoc || null,
          isVerified: false,
        }
      });
    }

    const accessToken = generateToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role, name: user.name });

    res.status(201).json({
      message: 'Rider application submitted successfully!',
      userId: user.id,
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Rider registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /register/rider/check-status - Request OTP to check application status
router.post('/rider/check-status', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { rider: true }
    });

    if (!user || user.role !== "RIDER") {
      return res.status(404).json({ error: 'No rider application found for this email' });
    }

    const otp = generateOtp();
    storeOtp(email, otp);
    await sendOtpEmail(email, otp);

    res.json({ message: 'OTP sent to your email', expiresIn: 600 });
  } catch (error: any) {
    console.error('Check rider status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /register/rider/verify-otp - Verify OTP and return application status
router.post('/rider/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    if (!verifyOtp(email, otp)) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { rider: true }
    });

    if (!user || user.role !== "RIDER") {
      return res.status(404).json({ error: 'No rider application found for this email' });
    }

    res.json({
      status: user.rider?.approvalStatus || 'PENDING',
      message: user.rider?.approvalStatus === "APPROVED"
        ? 'Your application has been approved!'
        : user.rider?.approvalStatus === "REJECTED"
        ? `Your application was rejected. Reason: ${user.rider?.rejectionReason || 'No reason provided'}`
        : 'Your application is still under review.'
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;