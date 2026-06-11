# 🧪 Recap Home - Complete Testing Guide

## Point of View (POV) Testing for All User Types

This guide will help you test the Recap Home platform from all perspectives before launch.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Test Accounts Setup](#-test-accounts-setup)
3. [Private User (Customer) POV](#-private-user-customer-pov)
4. [Business Owner POV](#-business-owner-pov)
5. [Rider POV](#-rider-pov)
6. [Admin POV](#-admin-pov)
7. [Developer POV](#-developer-pov)
8. [Checklist](#-checklist)

---

## 📦 Prerequisites

### 1. Start the Development Environment

```bash
cd /mnt/c/Users/Phoenix/OneDrive/Documents/SW - Forge/recap-home

# Install dependencies
npm install

# Start all services with TurboRepo
npm run dev
```

This will start:
- **Web App** (Customer): http://localhost:3000
- **Admin Portal**: http://localhost:3002  
- **API Backend**: http://localhost:3001
- **Database**: PostgreSQL (via Docker)
- **Redis**: For session management

### 2. Set Up Database

```bash
cd packages/database
$env:DATABASE_URL="postgresql://recap:recap123@localhost:5432/recap_home?schema=public"
npx prisma migrate dev --name init
npx prisma db seed  # If seed file exists
cd ../..
```

### 3. Configure Environment Variables

Create `.env` files in each app directory:

**apps/api/.env:**
```env
PORT=3001
JWT_SECRET=your-super-secret-key-for-production
DATABASE_URL=postgresql://recap:recap123@localhost:5432/recap_home?schema=public
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002
```

**apps/web/.env:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**apps/admin/.env:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 👤 Test Accounts Setup

### Default Admin Account (Use this to start)
Since you're a Developer, you should add yourself as an admin first:

1. Open the database directly or use the API
2. Create a user with role `SYSTEM_OPERATOR` or `DEVELOPER`

**Manual SQL (if needed):**
```sql
INSERT INTO users (id, email, password, name, role, email_verified, is_active)
VALUES ('your-user-id', 'your-email@example.com', '$2a$12$...', 'Your Name', 'DEVELOPER', true, true);
```

Or use the **Add Personnel** page once you have admin access.

---

## 👥 1. Private User (Customer) POV

### Access
- **URL**: http://localhost:3000
- **Registration**: http://localhost:3000/register/private

### Test Steps

#### 1.1 Registration
1. Go to http://localhost:3000/register
2. Click on **Private** card
3. Fill in the registration form:
   - Nome: `Mario`
   - Cognome: `Rossi`
   - Username: `mario.rossi`
   - Email: `mario.rossi@example.com`
   - Password: `Password123!`
   - Confirm Password: `Password123!`
4. Click **Registrati**
5. ✅ You should be redirected to login page

#### 1.2 Alternative: Google Registration
1. On the registration page, click **Registrati con Google**
2. Complete Google OAuth flow
3. ✅ Account created automatically with PRIVATE role

#### 1.3 Login
1. Go to http://localhost:3000/auth/login
2. Enter email: `mario.rossi@example.com`
3. Enter password: `Password123!`
4. Click **Accedi**
5. ✅ Should be logged in and redirected

#### 1.4 User Dashboard
1. After login, you should see your dashboard
2. Verify you can:
   - [ ] View your profile
   - [ ] Create a new order
   - [ ] View order history
   - [ ] Track orders in real-time
   - [ ] Access chat support

#### 1.5 Order Creation
1. Navigate to Orders or Create Order page
2. Select a business (if any exist)
3. Add products to cart
4. Specify delivery address
5. Select payment method
6. Place order
7. ✅ Order should be created with status PENDING

#### 1.6 Order Tracking
1. Go to Tracking page
2. Select an active order
3. ✅ See real-time location updates (if rider assigned)

#### 1.7 Chat Support
1. Look for chat widget on the page
2. Send a message
3. ✅ Message should be sent and visible

**✅ Private User POV: PASSED / FAILED**

---

## 🏪 2. Business Owner POV

### Access
- **Registration**: http://localhost:3000/register/business
- **Status Check**: N/A (auto-approved)

### Test Steps

#### 2.1 Registration (Multi-step Form)
1. Go to http://localhost:3000/register/business
2. **Step 1: Business Information**
   - Nome dell Ditta/Azienda: `Pizza Express`
   - Tipo di Attività: `SRL` (or any)
   - Partita IVA: `IT00000000001`
   - Categoria: `PIZZERIA`
   - Indirizzo Sede: `Via Roma 1, Milano`
   - Città: `Milano`
   - CAP: `20121`
   - Telefono: `+39 02 1234567`
   - Click **Continua**

3. **Step 2: Legal Representative**
   - Nome e Cognome Completo: `Marco Bianchi`
   - Data di Nascita: `1985-03-15`
   - Luogo di Nascita: `Roma`
   - Codice Fiscale: `BNCMRA85C15H501U`
   - Residenza: `Via Valle 2, Milano`
   - Email PEC: `pec@pizzaexpress.it`
   - Click **Continua**

4. **Step 3: Banking Information**
   - IBAN: `IT00X00000000000000000001`
   - BIC/SWIFT: `UNCRITMMXXX`
   - Intestatario Conto: `Pizza Express SRL`
   - Nome Banca: `UniCredit`
   - Documento di Prova: `https://example.com/iban-proof.jpg`
   - Click **Continua**

5. **Step 4: Credentials**
   - Username: `pizza.express`
   - Email di Accesso: `business@example.com`
   - Password: `Business123!`
   - Conferma Password: `Business123!`
   - Click **Completa Registrazione**

6. ✅ Should see success message: "Registrazione Inviata!"
7. Note: Business is **auto-approved** and can start immediately

#### 2.2 Login
1. Go to http://localhost:3000/auth/login
2. Enter email: `business@example.com`
3. Enter password: `Business123!`
4. Click **Accedi**
5. ✅ Should be logged in as BUSINESS role

#### 2.3 Business Dashboard
1. After login, navigate to business dashboard
2. Verify you can:
   - [ ] View business profile
   - [ ] Add/edit products
   - [ ] Manage business information
   - [ ] View incoming orders
   - [ ] Update order status
   - [ ] Configure payment methods
   - [ ] View statistics and analytics

#### 2.4 Add Products
1. Navigate to Products or Menu management
2. Add a new product:
   - Name: `Margherita Pizza`
   - Description: `Classic pizza with tomato and mozzarella`
   - Price: `8.50`
   - Category: `PIZZA`
   - Image URL: `https://example.com/pizza.jpg`
   - Stock: `100`
3. Save product
4. ✅ Product should be added to your catalog

#### 2.5 Payment Configuration
1. Navigate to Payment Settings
2. Configure payment methods:
   - Credit Card: ✅ Enabled
   - PayPal: ✅ Enabled
   - Satispay: ✅ Enabled
   - Cash: ✅ Enabled
3. Add API keys if testing actual payments
4. Save configuration
5. ✅ Payment methods configured

#### 2.6 Order Management
1. Wait for a customer to place an order (or create one as test user)
2. View incoming orders in dashboard
3. Accept or reject order
4. Update order status as it progresses
5. ✅ Full order lifecycle working

**✅ Business Owner POV: PASSED / FAILED**

---

## 🚴 3. Rider POV

### Access
- **Registration**: http://localhost:3000/register/rider
- **Status Check**: http://localhost:3000/register/rider/status

### Test Steps

#### 3.1 Registration (5-step Form)
1. Go to http://localhost:3000/register/rider
2. **Step 1: Personal Details**
   - Nome e Cognome Completo: `Antonio Esposito`
   - Data di Nascita: `1990-05-20`
   - Luogo di Nascita: `Napoli`
   - Nazionalità: `Italiana`
   - Codice Fiscale: `SPSTNT90E20F839L`
   - Click **Continua**

3. **Step 2: Address & Work**
   - Indirizzo di Residenza: `Via Solferino 10, Napoli`
   - Indirizzo di Domicilio: (leave empty or same as residence)
   - Dove desideri lavorare?: `Napoli`
   - Possiedi una Partita IVA?: `No`
   - Click **Continua**

4. **Step 3: Documents**
   - Fronte Carta d'Identità: `https://example.com/ci-front.jpg`
   - Retro Carta d'Identità: `https://example.com/ci-back.jpg`
   - Tessera Sanitaria: `https://example.com/ts.jpg`
   - (Permesso di Soggiorno: Only required if non-Italian)
   - Click **Continua**

5. **Step 4: Banking**
   - IBAN: `IT00X00000000000000000002`
   - BIC/SWIFT: `UNCRITMMXXX`
   - Intestatario Conto: `Antonio Esposito`
   - Nome Banca: `Intesa Sanpaolo`
   - Documento di Prova: `https://example.com/bank-proof.jpg`
   - Click **Continua**

6. **Step 5: Email Access**
   - Email: `rider@example.com`
   - Click **Invia Candidatura**

7. ✅ Should see: "Candidatura Inviata!"
8. ⚠️ **Important**: Rider must be **APPROVED by Admin** before accessing platform

#### 3.2 Check Application Status
1. Go to http://localhost:3000/register/rider/status
2. Enter email: `rider@example.com`
3. Click **Verifica Stato**
4. ✅ Should show: "In Revisione" (PENDING)
5. Wait for admin approval (see Admin POV section)
6. After approval, refresh - should show: "Approvata"

#### 3.3 Login (After Approval)
1. Go to http://localhost:3000/auth/login
2. Enter email: `rider@example.com`
3. Enter password: (the one you'll set after approval)
4. Click **Accedi**
5. ✅ Should be logged in as RIDER role

#### 3.4 Rider Dashboard
1. After login, navigate to rider dashboard
2. Verify you can:
   - [ ] View your profile
   - [ ] Update availability (Available/Unavailable)
   - [ ] View assigned orders
   - [ ] Accept/reject order assignments
   - [ ] Update order status (PICKED_UP, IN_TRANSIT, DELIVERED)
   - [ ] View real-time tracking
   - [ ] Access chat support
   - [ ] View your statistics and ratings

#### 3.5 Order Assignment
1. Wait for admin to assign an order (or create one as business)
2. View order in your assigned orders list
3. Accept the order
4. Update status to PICKED_UP when you pick up the order
5. Update status to IN_TRANSIT while delivering
6. Update status to DELIVERED when completed
7. ✅ Full delivery flow working

#### 3.6 Real-time Location Tracking
1. Ensure location permissions are enabled
2. While on delivery, your location should update in real-time
3. Customers should see your location on the map
4. ✅ Location tracking working

**✅ Rider POV: PASSED / FAILED**

---

## 👑 4. Admin POV

### Access
- **URL**: http://localhost:3002
- **Login**: http://localhost:3002/login

### Test Steps

#### 4.1 Login as Admin
1. Go to http://localhost:3002/login
2. Enter your admin credentials (email/password)
3. Click **Accedi**
4. ✅ Should be logged in and see admin dashboard

#### 4.2 Dashboard Overview
1. After login, you should see the **Infrastructure Management Portal**
2. Verify the welcome banner:
   - "Welcome to Recap Home Control Center"
   - "Infrastructure Management Portal - Manage all platform operations from here"
3. Check statistics cards at the top
4. View charts (Orders Overview, Revenue Overview, Users by Role)
5. View Recent Activity feed
6. ✅ Dashboard loading correctly

#### 4.3 User Management
1. Click **Users** in the sidebar
2. Verify you see the Users Management page with:
   - Total Users count
   - Stats cards (Active, Deactivated, Verified)
   - Filters (Search, Role, Status)
   - Users table with all registered users
3. Test user actions:
   - [ ] Filter users by role
   - [ ] Search for a specific user
   - [ ] Edit a user (change name, email, phone, role)
   - [ ] Deactivate a user
   - [ ] Activate a deactivated user
   - [ ] Delete a user
   - [ ] Change user role via dropdown
4. ✅ User management working

#### 4.4 Rider Management (YOUR NEW PAGE!)
1. Click **Riders** in the sidebar
2. ✅ You should see the complete Rider Management page

**Test Rider Approval Workflow:**

1. **View Pending Riders**
   - Filter by status: **PENDING**
   - Should see the rider you created earlier (`rider@example.com`)
   - Check the completion percentage (should be 100% if all fields filled)

2. **View Rider Details**
   - Click the **file icon** (📄) on the rider's row
   - ✅ Should open detailed rider profile with all information:
     - Personal Information
     - Address Information
     - Vehicle & License Information
     - Legal & Immigration Status
     - Application Status (showing as PENDING)
     - Rider Statistics

3. **Approve Rider**
   - Click the **green check icon** (✅) on the rider's row
   - Or from the detail dialog, click **Approve**
   - Fill in admin notes (optional): "Approved - all documents verified"
   - Select background check status: **Completed - All checks passed**
   - Read the confirmation message
   - Click **Approve Rider**
   - ✅ Rider status should change to APPROVED
   - ✅ Notification sent to rider

4. **Reject Rider (Test with another rider)**
   - Create another test rider application
   - Click the **red X icon** (❌) on the pending rider
   - Fill in rejection reason: "Missing required documents"
   - Read the warning message
   - Click **Reject Rider**
   - ✅ Rider status should change to REJECTED
   - ✅ Notification sent to rider with reason

5. **Toggle Rider Availability**
   - For approved riders, click the **user check/X icon**
   - Toggle between Available/Unavailable
   - ✅ Rider availability updated

6. **Search & Filter**
   - Search by rider name: `Antonio`
   - Filter by status: **APPROVED**
   - Filter by region (if configured)
   - Filter by availability
   - Click **Clear Filters** to reset
   - ✅ All filters working

7. **Statistics**
   - Check the 4 stat cards at the top
   - Total Riders count
   - Pending Approval count
   - Approved count
   - Rejected count
   - ✅ Stats updating correctly

**✅ Admin Rider Management: PASSED / FAILED**

#### 4.5 Add Personnel (Internal Users)
1. Click **Add Personnel** in the sidebar
2. Verify the page shows:
   - Form for adding internal personnel
   - Role selector with all internal roles
   - Quick actions for common roles
3. Create a test personnel:
   - Email: `personnel@example.com`
   - Name: `John Doe`
   - Role: `CUSTOMER_CARE`
   - Password: `Personnel123!`
   - Confirm Password: `Personnel123!`
4. Click **Add Personnel**
5. ✅ Personnel added successfully
6. Verify in Users page that the new user appears with correct role

#### 4.6 Emergency Controls
1. Click **Emergency** in the sidebar
2. Test maintenance mode:
   - Click **Enable Maintenance Mode**
   - Add message: "System maintenance in progress"
   - Toggle ON
   - ✅ Maintenance mode enabled
   - Visit web app (http://localhost:3000) - should show maintenance page
   - Disable maintenance mode
   - ✅ Maintenance mode disabled

3. Test system alert:
   - Fill alert form:
     - Title: "System Test Alert"
     - Message: "This is a test of the emergency alert system"
     - Severity: `high`
   - Click **Broadcast Alert**
   - ✅ Alert broadcast to all users
   - Check Recent Alerts section
   - ✅ Alert appears in history

#### 4.7 System Status
1. In Emergency page, check **System Status** card
2. Verify stats are loading:
   - Active Users
   - Businesses
   - Available Riders
   - Active Orders
3. ✅ System status displaying correctly

#### 4.8 Settings
1. Click **Settings** in the sidebar (if page exists)
2. Configure system settings:
   - Platform name
   - Default region
   - Payment configurations
   - Notification settings
3. Save settings
4. ✅ Settings saved successfully

**✅ Admin POV: PASSED / FAILED**

---

## 💻 5. Developer POV

### Access
- Full access to codebase
- Database access
- Admin portal access

### Test Steps

#### 5.1 Codebase Structure
1. Verify monorepo structure:
   ```bash
   ls -la apps/
   ls -la packages/
   ```
2. Check TurboRepo configuration:
   ```bash
   cat turbo.json
   ```
3. ✅ Monorepo structure correct

#### 5.2 Database Schema
1. Check Prisma schema:
   ```bash
   cat packages/database/prisma/schema.prisma
   ```
2. Verify all models exist:
   - [ ] User
   - [ ] RiderProfile
   - [ ] BusinessProfile
   - [ ] Order
   - [ ] Product
   - [ ] Region
   - [ ] PaymentConfig
   - [ ] Notification
   - [ ] Conversation
   - [ ] ChatMessage
3. ✅ All database models present

#### 5.3 API Endpoints
1. Start API server:
   ```bash
   cd apps/api && npm run dev
   ```
2. Test key endpoints:
   ```bash
   # Health check
   curl http://localhost:3001/health
   
   # Users
   curl http://localhost:3001/users -H "Authorization: Bearer YOUR_TOKEN"
   
   # Riders
   curl http://localhost:3001/riders -H "Authorization: Bearer YOUR_TOKEN"
   
   # Admin - Add personnel
   curl -X POST http://localhost:3001/admin/personnel \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email": "test@test.com", "name": "Test", "role": "DEVELOPER"}'
   ```
3. ✅ All API endpoints responding

#### 5.4 Authentication Flow
1. Test JWT token generation:
   - Register a user
   - Login and get JWT token
   - Verify token can be used for authenticated requests
   - Test token refresh
2. Test Google OAuth:
   - Verify Google OAuth URL generation
   - Test token exchange (if Google credentials configured)
3. ✅ Authentication working

#### 5.5 Real-time Features
1. Test Socket.io connection:
   ```bash
   # In browser console on web app
   const socket = io('http://localhost:3001');
   socket.on('connect', () => console.log('Connected!'));
   ```
2. Test order tracking:
   - Create an order as customer
   - Assign rider as admin
   - Update rider location
   - Verify customer sees location updates
3. ✅ Real-time features working

#### 5.6 Deployment Configuration
1. Check Railway configuration:
   ```bash
   cat apps/api/railway.json
   ```
2. Check Vercel configuration:
   ```bash
   cat apps/web/vercel.json
   cat apps/admin/vercel.json
   ```
3. Check Docker configuration:
   ```bash
   cat docker-compose.yml
   ```
4. ✅ Deployment configurations present

#### 5.7 Testing Infrastructure
1. Create test utilities (if needed):
   ```bash
   # Create a seed script
   touch packages/database/prisma/seed.ts
   ```
2. Add test data script for quick testing
3. ✅ Test infrastructure ready

**✅ Developer POV: PASSED / FAILED**

---

## ✅ CHECKLIST

### Before Launch

- [ ] **Database**: PostgreSQL running with Recap Home schema
- [ ] **Redis**: Running for session management
- [ ] **Environment Variables**: Configured for all apps
- [ ] **Google OAuth**: Client ID and Secret configured
- [ ] **JWT Secret**: Strong secret key configured
- [ ] **Admin Account**: At least one admin user created

### User Testing

- [ ] Private User registration and login
- [ ] Private User can create orders
- [ ] Private User can track orders
- [ ] Private User can use chat support
- [ ] Business registration and auto-approval
- [ ] Business can add products
- [ ] Business can manage orders
- [ ] Rider registration and pending status
- [ ] Rider approval by admin
- [ ] Rider can accept and deliver orders
- [ ] Rider location tracking works

### Admin Testing

- [ ] Admin can login
- [ ] Admin dashboard shows correct stats
- [ ] Admin can manage users (CRUD)
- [ ] Admin can manage riders (approve/reject)
- [ ] Admin can add internal personnel
- [ ] Admin can enable/disable maintenance mode
- [ ] Admin can broadcast alerts
- [ ] Admin can view system status

### Developer Testing

- [ ] Codebase structure verified
- [ ] Database schema complete
- [ ] API endpoints tested
- [ ] Authentication flow working
- [ ] Real-time features tested
- [ ] Deployment configurations ready

---

## 🎯 EXPECTED BEHAVIORS

### User Flows

```
Private User → Register → Login → Browse Businesses → Place Order → Track Order → Receive Delivery

Business Owner → Register (auto-approved) → Login → Add Products → Receive Orders → Manage Orders → Get Paid

Rider → Register (pending) → Wait for Approval → Login → Accept Orders → Deliver Orders → Get Paid

Admin → Login → Manage Users → Manage Riders (Approve/Reject) → Manage Businesses → Emergency Controls → Add Personnel
```

### Approval Workflows

- **Business**: Auto-approved immediately on registration
- **Rider**: Pending admin approval, admin must manually approve
- **Private User**: Auto-approved immediately on registration
- **Internal Personnel**: Added directly by admin, auto-approved

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: Cannot login after registration
**Fix**: Check if user is verified. For email/password registration, email verification might be required.

### Issue 2: Rider cannot login after approval
**Fix**: Rider needs to complete the full profile. Check if all required fields are filled in RiderProfile.

### Issue 3: Maintenance mode not showing
**Fix**: Ensure Socket.io is connected. Maintenance mode uses Socket.io for real-time updates.

### Issue 4: Maps not loading
**Fix**: Check Leaflet CSS and JS imports. Ensure OpenStreetMap tiles are configured.

### Issue 5: Payment methods not working
**Fix**: Configure payment provider API keys in PaymentConfig. For testing, use test/sandbox modes.

---

## 📞 SUPPORT

For issues during testing:
1. Check browser console (F12) for errors
2. Check server logs for API errors
3. Verify network requests in browser DevTools
4. Ensure all services are running (Database, Redis, API, Web, Admin)

---

## ✅ SIGN OFF

After completing all POV tests, sign off below:

- [ ] Private User POV: **PASSED** / **FAILED**
- [ ] Business Owner POV: **PASSED** / **FAILED**
- [ ] Rider POV: **PASSED** / **FAILED**
- [ ] Admin POV: **PASSED** / **FAILED**
- [ ] Developer POV: **PASSED** / **FAILED**

**Overall Platform Status**: ✅ READY FOR LAUNCH / ❌ NEEDS FIXES

**Tester Name**: _______________
**Date**: _______________
**Notes**: _______________

---

*This testing guide ensures all user types can use the platform correctly before public launch.*
