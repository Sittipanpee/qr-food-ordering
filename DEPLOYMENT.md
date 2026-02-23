# 🚀 Deployment Guide - QR Food Ordering System

## Prerequisites

- ✅ Supabase project created
- ✅ All features tested locally
- ✅ GitHub account
- ✅ Vercel account (free tier OK)

---

## Step 1: Initialize Git & Push to GitHub

### 1.1 Initialize Git Repository

```bash
cd /Users/testaccount/qr-food-ordering

# Initialize Git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: QR Food Ordering System MVP1

Features:
- Admin Panel (Auth, Categories, Menu, Promotions, Tables, Orders, Queue)
- Customer UI (Menu browsing, Cart, Order placement, Queue tickets)
- Market Mode & Restaurant Mode
- Supabase integration
- Mobile-first responsive design
- Thai language support

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 1.2 Create GitHub Repository

**Option A: Using GitHub CLI (gh)**
```bash
# Login to GitHub (if not already)
gh auth login

# Create repository
gh repo create qr-food-ordering --public --source=. --remote=origin --push

# Done! Repository created and pushed
```

**Option B: Using GitHub Website**
1. Go to https://github.com/new
2. Repository name: `qr-food-ordering`
3. Description: "QR Code Food Ordering System with Market & Restaurant modes"
4. Choose: Public or Private
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

Then push:
```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/qr-food-ordering.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Connect to Vercel

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
cd /Users/testaccount/qr-food-ordering
vercel

# When prompted:
# - Set up and deploy? Yes
# - Which scope? Your personal account
# - Link to existing project? No
# - Project name? qr-food-ordering
# - In which directory is your code located? ./
# - Want to modify settings? No

# Production deployment
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **DO NOT deploy yet** - need to add environment variables first!

### 2.2 Configure Environment Variables

**In Vercel Dashboard:**

1. Go to Project Settings → Environment Variables
2. Add the following variables:

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Production Secrets (IMPORTANT - Generate New!):**
```bash
# Generate ADMIN_PASSWORD_HASH
node -e "console.log(require('bcrypt').hashSync('YOUR_PRODUCTION_PASSWORD', 10))"
# Copy output → ADMIN_PASSWORD_HASH

# Generate JWT_SECRET
openssl rand -hex 32
# Copy output → JWT_SECRET

# Generate QUEUE_SECRET
openssl rand -hex 32
# Copy output → QUEUE_SECRET
```

**Add to Vercel:**
```
ADMIN_PASSWORD_HASH=<generated_hash>
JWT_SECRET=<generated_secret>
QUEUE_SECRET=<generated_secret>
```

**Application Config:**
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_RESTAURANT_NAME=ชื่อร้านของคุณ
NEXT_PUBLIC_DEFAULT_MODE=market
```

3. Make sure all variables are set for **Production** environment
4. Click "Save"

### 2.3 Deploy!

**If using CLI:**
```bash
vercel --prod
```

**If using Dashboard:**
- Click "Deploy" or trigger a new deployment
- Wait for build to complete (~2-3 minutes)
- Get your production URL: `https://qr-food-ordering-xxx.vercel.app`

---

## Step 3: Post-Deployment Testing

### 3.1 Test Production URL

```bash
# Test admin access
https://your-app.vercel.app/admin

# Test customer menu
https://your-app.vercel.app/menu?mode=market
```

### 3.2 Verify Features

**Admin Panel:**
- [ ] Login works with production password
- [ ] All CRUD operations work
- [ ] QR codes generate correctly
- [ ] Orders/Queue dashboard loads

**Customer Flow:**
- [ ] Menu loads with real data
- [ ] Can add items to cart
- [ ] Can place orders
- [ ] Queue tickets work

**Mobile Testing:**
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Check responsive design
- [ ] Verify touch targets

### 3.3 Performance Check

```bash
# Lighthouse test
npx lighthouse https://your-app.vercel.app --view

# Should aim for:
# Performance: 90+
# Accessibility: 90+
# Best Practices: 90+
# SEO: 90+
```

---

## Step 4: Setup Custom Domain (Optional)

### 4.1 In Vercel Dashboard

1. Go to Project Settings → Domains
2. Add your domain: `yourdomain.com`
3. Follow DNS setup instructions

### 4.2 DNS Configuration

Add these records to your DNS provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Vercel will auto-provision SSL certificate!**

---

## Step 5: Monitoring & Maintenance

### 5.1 Enable Vercel Analytics

1. Project Settings → Analytics
2. Enable Web Analytics (free)
3. Monitor performance

### 5.2 Setup Alerts

1. Project Settings → Integrations
2. Add Slack/Discord webhook
3. Get notified on deployment failures

### 5.3 Database Backups

**In Supabase Dashboard:**
1. Settings → Database
2. Enable Point-in-Time Recovery (PITR)
3. Setup regular backups

---

## 🚨 Important Security Notes

### Production Checklist:

- [ ] Changed default admin password
- [ ] Generated new JWT_SECRET (not dev key)
- [ ] Generated new QUEUE_SECRET (not dev key)
- [ ] SUPABASE_SERVICE_ROLE_KEY is secret (not in client code)
- [ ] Row Level Security (RLS) enabled on Supabase
- [ ] CORS configured properly
- [ ] Rate limiting enabled (Vercel Edge Config)

### Environment Variables:

**NEVER commit these to Git:**
- ❌ .env.local
- ❌ .env.production
- ❌ Any file with credentials

**These are already in .gitignore** ✅

---

## 🎉 Success!

Your QR Food Ordering System is now live!

**Share with customers:**
- 📱 Restaurant Mode: `https://your-app.vercel.app/menu?table=A1`
- 📱 Market Mode: `https://your-app.vercel.app/menu?mode=market`

**Admin access:**
- 🔐 `https://your-app.vercel.app/admin`

---

## 📚 Additional Resources

**Vercel Docs:**
- https://vercel.com/docs/frameworks/nextjs
- https://vercel.com/docs/environment-variables

**Supabase Docs:**
- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

**Next.js Docs:**
- https://nextjs.org/docs/deployment

---

## 🆘 Troubleshooting

### Build Fails

**Error: Module not found**
```bash
# Install missing dependencies
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Database Connection Error

**Check:**
1. Environment variables correct in Vercel
2. Supabase URL reachable
3. RLS policies not blocking admin access

### 404 on Routes

**Cause:** App Router might need to revalidate
**Fix:**
- Redeploy from Vercel dashboard
- Or trigger with `git push`

---

**Deployment Complete! 🚀🎉**
