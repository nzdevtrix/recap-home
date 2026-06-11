import { PrismaClient, UserRole, RiderApprovalStatus, BusinessStatus, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Recap Home database with test data for all POVs...\n');

  // ============================================
  // 1. REGIONS - Location data for testing
  // ============================================
  console.log('📍 Creating regions...');
  const milano = await prisma.region.upsert({
    where: { code: 'MI' },
    update: {},
    create: {
      name: 'Milano',
      code: 'MI',
      boundaries: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[9.1826, 45.4642], [9.1826, 45.4742], [9.1926, 45.4742], [9.1926, 45.4642], [9.1826, 45.4642]]]
      }),
      center: JSON.stringify({ lat: 45.4642, lng: 9.1926 }),
      isActive: true,
    },
  });

  const napoli = await prisma.region.upsert({
    where: { code: 'NA' },
    update: {},
    create: {
      name: 'Napoli',
      code: 'NA',
      boundaries: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[14.2465, 40.8401], [14.2465, 40.8501], [14.2565, 40.8501], [14.2565, 40.8401], [14.2465, 40.8401]]]
      }),
      center: JSON.stringify({ lat: 40.8401, lng: 14.2565 }),
      isActive: true,
    },
  });

  const roma = await prisma.region.upsert({
    where: { code: 'RM' },
    update: {},
    create: {
      name: 'Roma',
      code: 'RM',
      boundaries: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[12.4924, 41.8902], [12.4924, 41.9002], [12.5024, 41.9002], [12.5024, 41.8902], [12.4924, 41.8902]]]
      }),
      center: JSON.stringify({ lat: 41.8902, lng: 12.5024 }),
      isActive: true,
    },
  });

  console.log(`✅ Created ${(await prisma.region.findMany()).length} regions\n`);

  // ============================================
  // 2. ADMIN & DEVELOPER ACCOUNTS
  // ============================================
  console.log('👑 Creating admin and developer accounts...');
  
  // System Operator (Super Admin)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@recap.home' },
    update: {},
    create: {
      email: 'superadmin@recap.home',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G5ftHsQJqhN8/X', // password: Admin123!
      username: 'superadmin',
      name: 'Super Admin',
      firstName: 'System',
      lastName: 'Operator',
      role: 'SYSTEM_OPERATOR',
      emailVerified: true,
      isActive: true,
      phone: '+39 02 1234567',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuperAdmin',
    },
  });

  // Developer Account (User's default POV)
  const developer = await prisma.user.upsert({
    where: { email: 'developer@recap.home' },
    update: {},
    create: {
      email: 'developer@recap.home',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G5ftHsQJqhN8/X', // password: Developer123!
      username: 'dev',
      name: 'Lead Developer',
      firstName: 'Dev',
      lastName: 'Master',
      role: 'DEVELOPER',
      emailVerified: true,
      isActive: true,
      phone: '+39 02 9876543',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Developer',
    },
  });

  // Additional Admin for testing
  const admin = await prisma.user.upsert({
    where: { email: 'admin@recap.home' },
    update: {},
    create: {
      email: 'admin@recap.home',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G5ftHsQJqhN8/X', // password: Admin123!
      username: 'admin',
      name: 'Platform Admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
      phone: '+39 02 4567890',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  });

  // Customer Care Personnel
  const customerCare = await prisma.user.upsert({
    where: { email: 'support@recap.home' },
    update: {},
    create: {
      email: 'support@recap.home',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G5ftHsQJqhN8/X', // password: Support123!
      username: 'support',
      name: 'Customer Support',
      firstName: 'Support',
      lastName: 'Agent',
      role: 'CUSTOMER_CARE',
      emailVerified: true,
      isActive: true,
      phone: '+39 02 1112222',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Support',
    },
  });

  console.log(`✅ Created admin/developer accounts\n`);

  // ============================================
  // 3. PRIVATE USERS (Customers)
  // ============================================
  console.log('👥 Creating private user accounts...');

  const privateUsers = [
    {
      email: 'mario.rossi@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G5ftHsQJqhN8/X', // Password123!
      username: 'mario.rossi',
      name: 'Mario Rossi',
      firstName: 'Mario',
      lastName: 'Rossi',
      phone: '+39 333 1234567',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mario',
    },
    {
      email: 'luigi.bianchi@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G5ftHsQJqhN8/X',
      username: 'luigi.bianchi',
      name: 'Luigi Bianchi',
      firstName: 'Luigi',
      lastName: 'Bianchi',
      phone: '+39 333 2345678',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luigi',
    },
    {
      email: 'francesca.verdi@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G5ftHsQJqhN8/X',
      username: 'francesca.v',
      name: 'Francesca Verdi',
      firstName: 'Francesca',
      lastName: 'Verdi',
      phone: '+39 333 3456789',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Francesca',
    },
  ];

  const createdPrivateUsers: any[] = [];
  for (const userData of privateUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        role: 'PRIVATE',
        emailVerified: true,
        isActive: true,
      },
    });
    createdPrivateUsers.push(user);
  }

  console.log(`✅ Created ${createdPrivateUsers.length} private users\n`);

  // ============================================
  // 4. BUSINESS OWNERS (Auto-approved)
  // ============================================
  console.log('🏪 Creating business owner accounts...');

  const businessOwners = [
    {
      email: 'business@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G5ftHsQJqhN8/X', // Business123!
      username: 'pizza.express',
      name: 'Pizza Express',
      firstName: 'Marco',
      lastName: 'Bianchi',
      phone: '+39 02 1234567',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PizzaExpress',
      businessData: {
        legalName: 'Pizza Express SRL',
        legalType: 'SRL',
        ownerFullName: 'Marco Bianchi',
        ownerDob: new Date('1985-03-15'),
        ownerPlaceOfBirth: 'Roma',
        ownerCodiceFiscale: 'BNCMRA85C15H501U',
        ownerResidence: 'Via Valle 2, Milano',
        pecAddress: 'pec@pizzaexpress.it',
        vatId: 'IT00000000001',
        businessCategory: 'PIZZERIA',
        businessAddress: 'Via Roma 1, Milano',
        city: 'Milano',
        postalCode: '20121',
        phone: '+39 02 1234567',
        website: 'https://pizzaexpress.it',
        status: 'APPROVED' as BusinessStatus,
        isVerified: true,
        isOpen: true,
        openingHours: '09:00-23:00',
        regionId: milano.id,
      },
      products: [
        {
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato and mozzarella',
          price: 8.5,
          category: 'PIZZA',
          imageUrl: 'https://example.com/pizza-margherita.jpg',
          stock: 100,
        },
        {
          name: 'Pepperoni Pizza',
          description: 'Pizza with tomato, mozzarella, and pepperoni',
          price: 10.0,
          category: 'PIZZA',
          imageUrl: 'https://example.com/pizza-pepperoni.jpg',
          stock: 100,
        },
        {
          name: 'Coca Cola',
          description: 'Soft drink',
          price: 2.5,
          category: 'BEVERAGE',
          imageUrl: 'https://example.com/coca-cola.jpg',
          stock: 50,
        },
      ],
      paymentConfig: {
        acceptsCreditCard: true,
        acceptsPayPal: true,
        acceptsSatispay: true,
        acceptsCash: true,
        stripePublishableKey: 'pk_test_123456789',
        stripeSecretKey: 'sk_test_123456789',
      },
    },
    {
      email: 'trattoria@roma.it',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G5ftHsQJqhN8/X',
      username: 'trattoria.roma',
      name: 'Trattoria Romana',
      firstName: 'Giovanni',
      lastName: 'Rossi',
      phone: '+39 06 1234567',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trattoria',
      businessData: {
        legalName: 'Trattoria Romana SRL',
        legalType: 'SRL',
        ownerFullName: 'Giovanni Rossi',
        ownerDob: new Date('1975-06-20'),
        ownerPlaceOfBirth: 'Roma',
        ownerCodiceFiscale: 'RSSGNN75H20H501X',
        ownerResidence: 'Via Colosseo 10, Roma',
        pecAddress: 'pec@trattoriaromana.it',
        vatId: 'IT00000000002',
        businessCategory: 'TRATTORIA',
        businessAddress: 'Via del Colosseo 5, Roma',
        city: 'Roma',
        postalCode: '00184',
        phone: '+39 06 1234567',
        website: 'https://trattoriaromana.it',
        status: 'APPROVED' as BusinessStatus,
        isVerified: true,
        isOpen: true,
        openingHours: '10:00-22:00',
        regionId: roma.id,
      },
      products: [
        {
          name: 'Spaghetti Carbonara',
          description: 'Classic Roman pasta with eggs, cheese, pancetta, and pepper',
          price: 12.0,
          category: 'PASTA',
          imageUrl: 'https://example.com/carbonara.jpg',
          stock: 80,
        },
        {
          name: 'Amatriciana',
          description: 'Roman pasta with tomato sauce and guanciale',
          price: 11.5,
          category: 'PASTA',
          imageUrl: 'https://example.com/amatriciana.jpg',
          stock: 75,
        },
        {
          name: 'Tiramisu',
          description: 'Classic Italian dessert',
          price: 6.0,
          category: 'DESSERT',
          imageUrl: 'https://example.com/tiramisu.jpg',
          stock: 30,
        },
      ],
      paymentConfig: {
        acceptsCreditCard: true,
        acceptsPayPal: true,
        acceptsSatispay: false,
        acceptsCash: true,
      },
    },
  ];

  const createdBusinesses: any[] = [];
  for (const bizData of businessOwners) {
    // Create user
    const user = await prisma.user.upsert({
      where: { email: bizData.email },
      update: {},
      create: {
        email: bizData.email,
        password: bizData.password,
        username: bizData.username,
        name: bizData.name,
        firstName: bizData.firstName,
        lastName: bizData.lastName,
        role: 'BUSINESS',
        emailVerified: true,
        isActive: true,
        phone: bizData.phone,
        avatar: bizData.avatar,
      },
    });

    // Create business profile
    const business = await prisma.businessProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        ...bizData.businessData,
      },
    });

    // Create products
    for (const product of bizData.products) {
      await prisma.product.upsert({
        where: { id: `${business.id}-${product.name.replace(/\s+/g, '-').toLowerCase()}` },
        update: {},
        create: {
          businessId: business.id,
          ...product,
        },
      });
    }

    // Create payment config
    await prisma.paymentConfig.upsert({
      where: { businessId: business.id },
      update: {},
      create: {
        businessId: business.id,
        ...bizData.paymentConfig,
      },
    });

    createdBusinesses.push({ user, business });
  }

  console.log(`✅ Created ${createdBusinesses.length} business owners with profiles and products\n`);

  // ============================================
  // 5. RIDERS (Different statuses for testing)
  // ============================================
  console.log('🚴 Creating rider accounts...');

  const riders = [
    {
      email: 'rider@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G5ftHsQJqhN8/X',
      username: 'antonio.esposito',
      name: 'Antonio Esposito',
      firstName: 'Antonio',
      lastName: 'Esposito',
      phone: '+39 333 9876543',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Antonio',
      riderData: {
        fullName: 'Antonio Esposito',
        dateOfBirth: new Date('1990-05-20'),
        placeOfBirth: 'Napoli',
        nationality: 'Italiana',
        codiceFiscale: 'SPSTNT90E20F839L',
        residenceAddress: 'Via Solferino 10, Napoli',
        domicileAddress: 'Via Solferino 10, Napoli',
        desiredWorkCity: 'Napoli',
        hasBusiness: false,
        hasPermessoDiSoggiorno: false,
        approvalStatus: 'PENDING' as RiderApprovalStatus,
        licenseNumber: 'NA123456',
        licenseImage: 'https://example.com/license-antonio.jpg',
        vehicleType: 'MOTORCYCLE',
        vehiclePlate: 'NA123AB',
        vehicleColor: 'Red',
        regionId: napoli.id,
        isAvailable: false,
      },
      bankingInfo: {
        iban: 'IT00X00000000000000000002',
        bicSwift: 'UNCRITMMXXX',
        accountHolder: 'Antonio Esposito',
        bankName: 'Intesa Sanpaolo',
        bankProofDoc: 'https://example.com/bank-proof-antonio.jpg',
        isVerified: false,
      },
      documents: [
        { type: 'ID_FRONT', url: 'https://example.com/ci-front-antonio.jpg', verified: false },
        { type: 'ID_BACK', url: 'https://example.com/ci-back-antonio.jpg', verified: false },
        { type: 'HEALTH_CARD', url: 'https://example.com/ts-antonio.jpg', verified: false },
      ],
    },
    {
      email: 'rider2@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G5ftHsQJqhN8/X',
      username: 'marco.ferrari',
      name: 'Marco Ferrari',
      firstName: 'Marco',
      lastName: 'Ferrari',
      phone: '+39 333 8765432',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
      riderData: {
        fullName: 'Marco Ferrari',
        dateOfBirth: new Date('1988-07-15'),
        placeOfBirth: 'Milano',
        nationality: 'Italiana',
        codiceFiscale: 'FRRMRC88L15F205X',
        residenceAddress: 'Via Dante 5, Milano',
        domicileAddress: 'Via Dante 5, Milano',
        desiredWorkCity: 'Milano',
        hasBusiness: false,
        hasPermessoDiSoggiorno: false,
        approvalStatus: 'APPROVED' as RiderApprovalStatus,
        approvedById: admin.id,
        approvedAt: new Date(),
        licenseNumber: 'MI987654',
        licenseImage: 'https://example.com/license-marco.jpg',
        vehicleType: 'BICYCLE',
        vehiclePlate: 'MI456CD',
        vehicleColor: 'Blue',
        regionId: milano.id,
        isAvailable: true,
      },
      bankingInfo: {
        iban: 'IT00X00000000000000000003',
        bicSwift: 'UNCRITMMXXX',
        accountHolder: 'Marco Ferrari',
        bankName: 'UniCredit',
        bankProofDoc: 'https://example.com/bank-proof-marco.jpg',
        isVerified: true,
        verifiedAt: new Date(),
      },
      documents: [
        { type: 'ID_FRONT', url: 'https://example.com/ci-front-marco.jpg', verified: true, verifiedAt: new Date() },
        { type: 'ID_BACK', url: 'https://example.com/ci-back-marco.jpg', verified: true, verifiedAt: new Date() },
        { type: 'HEALTH_CARD', url: 'https://example.com/ts-marco.jpg', verified: true, verifiedAt: new Date() },
      ],
    },
    {
      email: 'rider3@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G5ftHsQJqhN8/X',
      username: 'luca.moretti',
      name: 'Luca Moretti',
      firstName: 'Luca',
      lastName: 'Moretti',
      phone: '+39 333 7654321',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luca',
      riderData: {
        fullName: 'Luca Moretti',
        dateOfBirth: new Date('1992-09-10'),
        placeOfBirth: 'Roma',
        nationality: 'Italiana',
        codiceFiscale: 'MRTLUC92P10H501S',
        residenceAddress: 'Via Veneto 20, Roma',
        domicileAddress: 'Via Veneto 20, Roma',
        desiredWorkCity: 'Roma',
        hasBusiness: false,
        hasPermessoDiSoggiorno: false,
        approvalStatus: 'REJECTED' as RiderApprovalStatus,
        rejectionReason: 'Missing required documents',
        reviewedAt: new Date(),
        regionId: roma.id,
        isAvailable: false,
      },
      bankingInfo: {
        iban: 'IT00X00000000000000000004',
        bicSwift: 'UNCRITMMXXX',
        accountHolder: 'Luca Moretti',
        bankName: 'Banca Intesa',
        isVerified: false,
      },
      documents: [
        { type: 'ID_FRONT', url: 'https://example.com/ci-front-luca.jpg', verified: false },
        { type: 'ID_BACK', url: 'https://example.com/ci-back-luca.jpg', verified: false },
      ],
    },
  ];

  const createdRiders: any[] = [];
  for (const riderData of riders) {
    // Create user
    const user = await prisma.user.upsert({
      where: { email: riderData.email },
      update: {},
      create: {
        email: riderData.email,
        password: riderData.password,
        username: riderData.username,
        name: riderData.name,
        firstName: riderData.firstName,
        lastName: riderData.lastName,
        role: 'RIDER',
        emailVerified: true,
        isActive: true,
        phone: riderData.phone,
        avatar: riderData.avatar,
      },
    });

    // Create rider profile
    const riderProfile = await prisma.riderProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        ...riderData.riderData,
      },
    });

    // Create banking info
    await prisma.bankingInfo.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        ...riderData.bankingInfo,
      },
    });

    // Create documents
    for (const doc of riderData.documents) {
      await prisma.document.upsert({
        where: { id: `${user.id}-${doc.type}` },
        update: {},
        create: {
          userId: user.id,
          ...doc,
        },
      });
    }

    createdRiders.push({ user, riderProfile });
  }

  console.log(`✅ Created ${createdRiders.length} riders with different statuses\n`);

  // ============================================
  // 6. SAMPLE ORDERS
  // ============================================
  console.log('📦 Creating sample orders...');

  // Get the users and businesses we created
  const marioUser = await prisma.user.findUnique({ where: { email: 'mario.rossi@example.com' } });
  const luigiUser = await prisma.user.findUnique({ where: { email: 'luigi.bianchi@example.com' } });
  const pizzaExpress = await prisma.businessProfile.findFirst({ where: { legalName: 'Pizza Express SRL' } });
  const trattoria = await prisma.businessProfile.findFirst({ where: { legalName: 'Trattoria Romana SRL' } });
  const approvedRider = await prisma.riderProfile.findFirst({ where: { approvalStatus: 'APPROVED' } });

  if (marioUser && pizzaExpress) {
    // Order 1: PENDING order from Mario to Pizza Express
    await prisma.order.upsert({
      where: { orderNumber: 'ORD-001' },
      update: {},
      create: {
        orderNumber: 'ORD-001',
        userId: marioUser.id,
        businessId: pizzaExpress.id,
        items: JSON.stringify([
          { id: 'margherita-1', name: 'Margherita Pizza', price: 8.5, quantity: 2 },
          { id: 'coca-cola-1', name: 'Coca Cola', price: 2.5, quantity: 2 },
        ]),
        total: 18.5 + 5.0,
        deliveryFee: 2.0,
        grandTotal: 23.0,
        status: 'PENDING' as OrderStatus,
        pickupAddress: 'Via Roma 1, Milano',
        deliveryAddress: 'Via Dante 10, Milano',
        deliveryNotes: 'Please ring the bell',
        paymentMethod: 'CREDIT_CARD' as PaymentMethod,
        paymentStatus: 'PENDING' as PaymentStatus,
      },
    });

    // Order 2: ACCEPTED order from Mario to Pizza Express with rider assigned
    if (approvedRider) {
      await prisma.order.upsert({
        where: { orderNumber: 'ORD-002' },
        update: {},
        create: {
          orderNumber: 'ORD-002',
          userId: marioUser.id,
          businessId: pizzaExpress.id,
          riderId: approvedRider.id,
          items: JSON.stringify([
            { id: 'pepperoni-1', name: 'Pepperoni Pizza', price: 10.0, quantity: 1 },
            { id: 'coca-cola-2', name: 'Coca Cola', price: 2.5, quantity: 1 },
          ]),
          total: 10.0 + 2.5,
          deliveryFee: 2.0,
          grandTotal: 14.5,
          status: 'ACCEPTED' as OrderStatus,
          pickupAddress: 'Via Roma 1, Milano',
          deliveryAddress: 'Via Manzoni 5, Milano',
          paymentMethod: 'PAYPAL' as PaymentMethod,
          paymentStatus: 'PAID' as PaymentStatus,
          paymentAmount: 14.5,
        },
      });

      // Order 3: PICKED_UP order
      await prisma.order.upsert({
        where: { orderNumber: 'ORD-003' },
        update: {},
        create: {
          orderNumber: 'ORD-003',
          userId: luigiUser?.id || marioUser.id,
          businessId: pizzaExpress.id,
          riderId: approvedRider.id,
          items: JSON.stringify([
            { id: 'margherita-2', name: 'Margherita Pizza', price: 8.5, quantity: 1 },
          ]),
          total: 8.5,
          deliveryFee: 2.0,
          grandTotal: 10.5,
          status: 'PICKED_UP' as OrderStatus,
          pickupAddress: 'Via Roma 1, Milano',
          deliveryAddress: 'Via Garibaldi 15, Milano',
          pickedUpAt: new Date(),
          paymentMethod: 'CASH' as PaymentMethod,
          paymentStatus: 'PENDING' as PaymentStatus,
        },
      });

      // Order 4: IN_TRANSIT order
      await prisma.order.upsert({
        where: { orderNumber: 'ORD-004' },
        update: {},
        create: {
          orderNumber: 'ORD-004',
          userId: luigiUser?.id || marioUser.id,
          businessId: trattoria?.id || pizzaExpress.id,
          riderId: approvedRider.id,
          items: JSON.stringify([
            { id: 'carbonara-1', name: 'Spaghetti Carbonara', price: 12.0, quantity: 2 },
          ]),
          total: 24.0,
          deliveryFee: 3.0,
          grandTotal: 27.0,
          status: 'IN_TRANSIT' as OrderStatus,
          pickupAddress: trattoria?.businessAddress || pizzaExpress.businessAddress,
          deliveryAddress: 'Via Veneto 10, Roma',
          pickedUpAt: new Date(Date.now() - 3600000), // 1 hour ago
          paymentMethod: 'SATISPAY' as PaymentMethod,
          paymentStatus: 'PAID' as PaymentStatus,
          paymentAmount: 27.0,
        },
      });

      // Order 5: DELIVERED order
      await prisma.order.upsert({
        where: { orderNumber: 'ORD-005' },
        update: {},
        create: {
          orderNumber: 'ORD-005',
          userId: luigiUser?.id || marioUser.id,
          businessId: trattoria?.id || pizzaExpress.id,
          riderId: approvedRider.id,
          items: JSON.stringify([
            { id: 'tiramisu-1', name: 'Tiramisu', price: 6.0, quantity: 1 },
          ]),
          total: 6.0,
          deliveryFee: 1.5,
          grandTotal: 7.5,
          status: 'DELIVERED' as OrderStatus,
          pickupAddress: trattoria?.businessAddress || pizzaExpress.businessAddress,
          deliveryAddress: 'Via Colosseo 20, Roma',
          pickedUpAt: new Date(Date.now() - 7200000), // 2 hours ago
          deliveredAt: new Date(Date.now() - 3600000), // 1 hour ago
          userRating: 5,
          riderRating: 5,
          businessRating: 5,
          paymentMethod: 'CREDIT_CARD' as PaymentMethod,
          paymentStatus: 'PAID' as PaymentStatus,
          paymentAmount: 7.5,
        },
      });
    }

    console.log(`✅ Created sample orders with different statuses\n`);
  }

  // ============================================
  // 7. NOTIFICATIONS
  // ============================================
  console.log('🔔 Creating sample notifications...');

  const notifications = [
    {
      userId: marioUser?.id || '',
      title: 'Order Confirmed',
      message: 'Your order ORD-001 has been confirmed by Pizza Express',
      type: 'ORDER',
      data: JSON.stringify({ orderId: 'ORD-001', orderNumber: 'ORD-001' }),
      isRead: false,
      isSent: true,
    },
    {
      userId: approvedRider?.userId || '',
      title: 'New Order Assigned',
      message: 'You have been assigned to order ORD-002',
      type: 'ORDER',
      data: JSON.stringify({ orderId: 'ORD-002', orderNumber: 'ORD-002' }),
      isRead: false,
      isSent: true,
    },
    {
      userId: admin.id,
      title: 'New Rider Application',
      message: 'A new rider application is pending your approval',
      type: 'RIDER',
      data: JSON.stringify({ riderId: createdRiders[0]?.riderProfile?.id || '' }),
      isRead: false,
      isSent: true,
    },
  ];

  for (const notification of notifications) {
    if (notification.userId) {
      await prisma.notification.upsert({
        where: { id: `${notification.userId}-${notification.title}` },
        update: {},
        create: notification,
      });
    }
  }

  console.log(`✅ Created sample notifications\n`);

  // ============================================
  // 8. CONVERSATIONS & CHAT MESSAGES
  // ============================================
  console.log('💬 Creating sample conversations...');

  if (marioUser && pizzaExpress) {
    // Conversation between Mario and Pizza Express
    const conversation = await prisma.conversation.upsert({
      where: { id: `conv-${marioUser.id}-${pizzaExpress.id}` },
      update: {},
      create: {
        userId: marioUser.id,
        orderId: 'ORD-001',
        isOpen: true,
        isResolved: false,
      },
    });

    // Sample messages
    const messages = [
      {
        conversationId: conversation.id,
        senderId: marioUser.id,
        receiverId: pizzaExpress.userId,
        message: 'Hi, I placed order ORD-001. When will it be ready?',
        isAi: false,
        orderId: 'ORD-001',
        role: 'CUSTOMER',
        isRead: true,
      },
      {
        conversationId: conversation.id,
        senderId: pizzaExpress.userId,
        receiverId: marioUser.id,
        message: 'Hello! Your order will be ready in 20-25 minutes. Thank you for your patience!',
        isAi: false,
        orderId: 'ORD-001',
        role: 'BUSINESS',
        isRead: false,
      },
    ];

    for (const msg of messages) {
      await prisma.chatMessage.upsert({
        where: { id: `${conversation.id}-${msg.message.substring(0, 20)}` },
        update: {},
        create: msg,
      });
    }

    console.log(`✅ Created sample conversation with messages\n`);
  }

  // ============================================
  // 9. RIDER SHIFTS
  // ============================================
  console.log('🕒 Creating rider shifts...');

  if (approvedRider) {
    // Create a shift for today
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);

    await prisma.riderShift.upsert({
      where: { id: `shift-${approvedRider.id}-${now.toISOString().split('T')[0]}` },
      update: {},
      create: {
        riderId: approvedRider.id,
        startTime: startOfDay,
        endTime: endOfDay,
        isActive: true,
      },
    });

    console.log(`✅ Created rider shift\n`);
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('📊 SEED SUMMARY');
  console.log('═'.repeat(60));
  
  const userCount = await prisma.user.count();
  const businessCount = await prisma.businessProfile.count();
  const riderCount = await prisma.riderProfile.count();
  const orderCount = await prisma.order.count();
  const productCount = await prisma.product.count();
  const regionCount = await prisma.region.count();
  
  console.log(`👤 Users:        ${userCount}`);
  console.log(`🏪 Businesses:   ${businessCount}`);
  console.log(`🚴 Riders:       ${riderCount}`);
  console.log(`📦 Orders:       ${orderCount}`);
  console.log(`🍕 Products:     ${productCount}`);
  console.log(`📍 Regions:      ${regionCount}`);
  console.log('\n');
  
  console.log('🎯 Test Accounts by POV:');
  console.log('─'.repeat(60));
  console.log('ADMIN/DEVELOPER:');
  console.log(`  • Super Admin: superadmin@recap.home / Admin123!`);
  console.log(`  • Developer:   developer@recap.home / Developer123!`);
  console.log(`  • Admin:       admin@recap.home / Admin123!`);
  console.log(`  • Support:     support@recap.home / Support123!`);
  console.log('\n');
  console.log('PRIVATE USERS (Customers):');
  console.log(`  • Mario Rossi:      mario.rossi@example.com / Password123!`);
  console.log(`  • Luigi Bianchi:    luigi.bianchi@example.com / Password123!`);
  console.log(`  • Francesca Verdi: francesca.verdi@example.com / Password123!`);
  console.log('\n');
  console.log('BUSINESS OWNERS:');
  console.log(`  • Pizza Express:  business@example.com / Business123!`);
  console.log(`  • Trattoria Romana: trattoria@roma.it / Business123!`);
  console.log('\n');
  console.log('RIDERS:');
  console.log(`  • Antonio Esposito: rider@example.com / Password123! (PENDING)`);
  console.log(`  • Marco Ferrari:    rider2@example.com / Password123! (APPROVED)`);
  console.log(`  • Luca Moretti:     rider3@example.com / Password123! (REJECTED)`);
  console.log('\n');
  
  console.log('✅ Database seeding completed successfully!');
  console.log('✅ Ready for POV testing as described in TESTING_GUIDE.md');
  console.log('═'.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
