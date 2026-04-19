# Team Anantam Inventory — Deployment Guide
## Free Production Setup: Firebase + Resend + Vercel

---

## What You'll Set Up

| Service | Purpose | Cost |
|---------|---------|------|
| **Firebase** (Google) | Database (Firestore) — stores all records, admins, OTPs | Free (Spark plan) |
| **Resend** | Sends OTP emails | Free (3,000 emails/month) |
| **Vercel** | Hosts the website | Free forever |
| **GitHub** | Stores your code (needed for Vercel) | Free |

**Total cost: ₹0**

---

## STEP 1 — Prepare Your Files

1. Download the project folder `anantam-inventory` from this chat.
2. Copy your logo file (`anantam_logo.png`) into the `public/` folder and rename it to `logo.png`.
   - Final path: `anantam-inventory/public/logo.png`

---

## STEP 2 — Create a Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"** → name it `anantam-inventory` → click through the steps
3. Once created, click **"Web"** icon (`</>`) to add a web app
4. Give it a nickname like `anantam-web` → click **"Register app"**
5. You'll see a `firebaseConfig` object like this:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "anantam-inventory.firebaseapp.com",
     projectId: "anantam-inventory",
     ...
   }
   ```
6. **Copy these values** — you'll need them in the next steps.

### Enable Firestore Database
1. In Firebase Console, go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** → select a region close to India (e.g. `asia-south1`) → click **Enable**

### Deploy Firestore Security Rules
1. In Firestore → click **"Rules"** tab
2. Replace everything with the contents of `firestore.rules` from your project
3. Click **"Publish"**

---

## STEP 3 — Add Firebase Config to Your Project

Open `src/lib/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "YOUR_ACTUAL_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
}
```

Also open `scripts/seed-admin.mjs` and paste the same config there.

---

## STEP 4 — Create Your First Admin Account

This runs once to add the head admin to Firebase.

Open a terminal in the `anantam-inventory` folder:

```bash
# Install dependencies
npm install

# Run the seed script
node scripts/seed-admin.mjs
```

You should see:
```
✅ Admin created successfully!
   Name:     Head Admin
   Email:    admin@pccoemotorsports.in
   Password: anantam2024
```

> ⚠️ After your first login, go to **Admin → Admin Accounts** and reset your password immediately via Forgot Password.

---

## STEP 5 — Set Up Resend (Email OTPs)

1. Go to **https://resend.com** → Sign up (free)
2. After signing in, click **"API Keys"** in the sidebar
3. Click **"Create API Key"** → name it `anantam-inventory` → copy the key (starts with `re_`)

### For Testing (No Domain Needed)
- Resend gives you a free `onboarding@resend.dev` sender address for testing
- OTPs will be sent from this address immediately, no setup required

### For Production (Custom Domain — Do Later)
- Go to **Domains** in Resend → Add `pccoemotorsports.in`
- Follow the DNS verification steps your domain provider shows
- Once verified, you can send from `noreply@pccoemotorsports.in`

---

## STEP 6 — Push to GitHub

1. Go to **https://github.com** → Sign in → click **"New repository"**
2. Name it `anantam-inventory` → keep it **Private** → click **"Create repository"**
3. In your terminal:

```bash
cd anantam-inventory
git init
git add .
git commit -m "Initial commit — Team Anantam Inventory"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/anantam-inventory.git
git push -u origin main
```

---

## STEP 7 — Deploy on Vercel

1. Go to **https://vercel.com** → Sign up with your GitHub account
2. Click **"Add New Project"** → import `anantam-inventory` from GitHub
3. Vercel auto-detects it as a Vite project. Click **"Deploy"** — it'll build in ~1 minute.

### Add Environment Variables (IMPORTANT)
After the first deploy, go to:
**Project → Settings → Environment Variables**

Add these two variables:

| Name | Value |
|------|-------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` (from Resend dashboard) |
| `FROM_EMAIL` | `onboarding@resend.dev` (or your custom domain later) |

After adding them, go to **Deployments → click the 3-dot menu → Redeploy**.

---

## STEP 8 — Test Everything

Visit your Vercel URL (e.g. `https://anantam-inventory.vercel.app`).

### Test Checklist:
- [ ] Landing page shows both portals
- [ ] Member login works (enter any name + PRN)
- [ ] Member can check out an item — verify it appears in Firebase Firestore console
- [ ] Member can return an item
- [ ] Admin login works with the seeded credentials
- [ ] Admin can see all records, currently-out items
- [ ] Admin can add a new admin account
- [ ] Forgot Password → OTP arrives in email → password resets successfully

---

## STEP 9 — Set a Custom Domain (Optional)

1. In Vercel → Project → Settings → Domains
2. Add your domain (e.g. `inventory.pccoemotorsports.in`)
3. Follow the DNS instructions Vercel provides
4. Free SSL certificate is included automatically

---

## File Structure Reference

```
anantam-inventory/
├── api/
│   └── send-otp.js          ← Vercel serverless function (email OTP)
├── public/
│   └── logo.png             ← ⚠️ PUT YOUR LOGO HERE
├── scripts/
│   └── seed-admin.mjs       ← Run once to create first admin
├── src/
│   ├── components/
│   │   └── Header.jsx
│   ├── lib/
│   │   ├── firebase.js      ← ⚠️ ADD YOUR FIREBASE CONFIG HERE
│   │   ├── db.js            ← All Firestore operations
│   │   ├── crypto.js        ← Password hashing
│   │   └── AuthContext.jsx  ← Session management
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── MemberLogin.jsx
│   │   ├── MemberDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── firestore.rules           ← Paste into Firebase Console
├── vercel.json
├── package.json
└── index.html
```

---

## Troubleshooting

**"Firebase: Error (permission-denied)"**
→ Go to Firebase Console → Firestore → Rules → make sure you published the rules from `firestore.rules`

**OTP email not arriving**
→ Check spam folder. Verify `RESEND_API_KEY` is set in Vercel environment variables and you redeployed after adding it.

**Blank page on Vercel**
→ Check Vercel build logs. Usually means a missing import or the Firebase config still has placeholder values.

**"Module not found" errors**
→ Run `npm install` locally and push again. Make sure `node_modules` is in `.gitignore`.

---

## Need Help?

If you get stuck on any step, share the error message and which step you're on — happy to help debug!
