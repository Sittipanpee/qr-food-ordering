# Manual Browser Testing Checklist
**QR Food Ordering System - E2E Testing Guide**

**Date:** 2026-02-23
**Version:** 1.0
**Environment:** Development (localhost:3000)
**Test Password:** `admin123`

---

## How to Use This Checklist

1. **Test in Order** - Follow sections sequentially
2. **Mark Results** - Check [✓] for pass, [✗] for fail, [~] for partial
3. **Document Issues** - Use Bug Report Template at the end
4. **Take Screenshots** - For any failures or unexpected behavior
5. **Test on Multiple Browsers** - Chrome, Firefox, Safari minimum
6. **Mobile Testing is CRITICAL** - Most customers use mobile

---

## Pre-Testing Setup

### Development Server
- [ ] Server running on http://localhost:3000
- [ ] No console errors on startup
- [ ] All dependencies installed
- [ ] .env.local configured (if needed)

### Browser Setup
- [ ] Clear browser cache
- [ ] Open DevTools (F12)
- [ ] Monitor Console tab for errors
- [ ] Monitor Network tab for failed requests
- [ ] Enable "Preserve log" in Network tab

---

## Phase 1: Authentication Flow (30 minutes)

### Test 1.1: Access Admin Without Login
**Goal:** Verify unauthenticated users are redirected to login

**Steps:**
1. [ ] Open browser in incognito/private mode
2. [ ] Navigate to http://localhost:3000/admin
3. [ ] Observe redirect

**Expected Results:**
- [ ] Redirected to `/admin/login`
- [ ] URL contains `?redirect=/admin` parameter
- [ ] No flash of admin content
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 1.2: Login Page UI
**Goal:** Verify login page displays correctly

**Steps:**
1. [ ] Navigate to http://localhost:3000/admin/login
2. [ ] Observe page layout

**Expected Results:**
- [ ] Page loads without errors
- [ ] Logo/icon displays (🍽️)
- [ ] "Admin Panel" title visible
- [ ] "รหัสผ่าน" (Password) label visible
- [ ] Password input field visible
- [ ] Password field is type="password" (masked)
- [ ] "เข้าสู่ระบบ" (Login) button visible
- [ ] Clean, professional design
- [ ] Responsive layout
- [ ] No layout shifts

**Pass/Fail:** ___________

---

### Test 1.3: Login with Wrong Password
**Goal:** Verify error handling for incorrect password

**Steps:**
1. [ ] Navigate to `/admin/login`
2. [ ] Enter password: `wrongpassword`
3. [ ] Click "เข้าสู่ระบบ" button
4. [ ] Observe result

**Expected Results:**
- [ ] Error message displayed
- [ ] Message is clear (e.g., "รหัสผ่านไม่ถูกต้อง")
- [ ] User stays on login page
- [ ] Input field cleared OR retains value
- [ ] No redirect occurs
- [ ] No console errors (except expected 401)

**Pass/Fail:** ___________

---

### Test 1.4: Login with Correct Password
**Goal:** Verify successful login flow

**Steps:**
1. [ ] Navigate to `/admin/login`
2. [ ] Enter password: `admin123`
3. [ ] Click "เข้าสู่ระบบ" button
4. [ ] Observe result

**Expected Results:**
- [ ] Successful login
- [ ] Redirected to `/admin` (dashboard)
- [ ] No error messages
- [ ] Admin UI loads
- [ ] Sidebar visible with navigation
- [ ] Session cookie set (check DevTools → Application → Cookies)
- [ ] Cookie name: `admin_session`
- [ ] Cookie is HttpOnly
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 1.5: Session Persistence
**Goal:** Verify session persists across page refreshes

**Steps:**
1. [ ] Login successfully (Test 1.4)
2. [ ] Refresh page (F5 or Cmd+R)
3. [ ] Navigate to different admin page (e.g., `/admin/categories`)
4. [ ] Refresh again
5. [ ] Close tab and reopen http://localhost:3000/admin

**Expected Results:**
- [ ] Stays logged in after refresh
- [ ] No re-login required
- [ ] Stays logged in on different admin pages
- [ ] Session cookie persists
- [ ] Stays logged in after closing/reopening tab
- [ ] No flash of login page

**Pass/Fail:** ___________

---

### Test 1.6: Protected Routes When Logged In
**Goal:** Verify all admin routes accessible when authenticated

**Steps:**
1. [ ] Login successfully
2. [ ] Navigate to `/admin/categories`
3. [ ] Navigate to `/admin/menu`
4. [ ] Navigate to `/admin/promotions`
5. [ ] Navigate to `/admin/tables`
6. [ ] Navigate to `/admin/orders`
7. [ ] Navigate to `/admin/queue`
8. [ ] Navigate to `/admin/settings`

**Expected Results:**
- [ ] All pages load without redirect
- [ ] No login prompts
- [ ] Content displays correctly
- [ ] Navigation works
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 1.7: Logout Flow
**Goal:** Verify logout clears session and redirects

**Steps:**
1. [ ] Login successfully
2. [ ] Find logout button in sidebar (scroll if needed)
3. [ ] Click logout button
4. [ ] Observe result
5. [ ] Try accessing `/admin` again

**Expected Results:**
- [ ] Logout button visible in sidebar
- [ ] Click triggers logout
- [ ] Redirected to `/admin/login`
- [ ] Session cookie cleared (check DevTools)
- [ ] Accessing `/admin` redirects to login
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 1.8: Redirect Parameter After Login
**Goal:** Verify redirect parameter works correctly

**Steps:**
1. [ ] Logout if logged in
2. [ ] Navigate to `/admin/categories` (while logged out)
3. [ ] Should redirect to `/admin/login?redirect=/admin/categories`
4. [ ] Login with `admin123`
5. [ ] Observe redirect destination

**Expected Results:**
- [ ] Redirected to login with redirect param
- [ ] After login, redirected to `/admin/categories` (not `/admin`)
- [ ] Categories page loads correctly
- [ ] No errors

**Pass/Fail:** ___________

---

## Phase 2: Admin Panel - Categories Management (15 minutes)

### Test 2.1: View Categories List
**Goal:** Verify categories page displays correctly

**Steps:**
1. [ ] Login to admin
2. [ ] Navigate to `/admin/categories`
3. [ ] Observe page layout

**Expected Results:**
- [ ] Page title "Categories" visible
- [ ] Description text visible
- [ ] "+ Add Category" button visible
- [ ] Category cards displayed (if mock data loaded)
- [ ] Summary statistics visible (Total/Active/Inactive)
- [ ] Clean, grid layout
- [ ] Responsive design
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 2.2: Create New Category
**Goal:** Verify category creation works

**Steps:**
1. [ ] Click "+ Add Category" button
2. [ ] Modal/dialog opens
3. [ ] Fill in form:
   - Name: "Test Category"
   - Description: "Test Description"
   - Display Order: 99
   - Active: Toggle ON
4. [ ] Click "Create" button
5. [ ] Observe result

**Expected Results:**
- [ ] Modal opens smoothly
- [ ] Form fields render correctly
- [ ] All fields editable
- [ ] "Create" button enabled
- [ ] After submit, modal closes
- [ ] New category appears in list
- [ ] Success feedback (or silent success)
- [ ] Page updates without full reload
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 2.3: Edit Existing Category
**Goal:** Verify category editing works

**Steps:**
1. [ ] Find any category card
2. [ ] Click "Edit" button
3. [ ] Modal opens with pre-filled data
4. [ ] Change name to "Updated Category"
5. [ ] Change description
6. [ ] Click "Update" button
7. [ ] Observe result

**Expected Results:**
- [ ] Edit button visible and clickable
- [ ] Modal opens with existing data
- [ ] All fields pre-filled correctly
- [ ] Can modify all fields
- [ ] After submit, modal closes
- [ ] Category updated in list
- [ ] Changes reflected immediately
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 2.4: Toggle Category Active/Inactive
**Goal:** Verify activation toggle works

**Steps:**
1. [ ] Find an active category
2. [ ] Click "Deactivate" button
3. [ ] Observe result
4. [ ] Click "Activate" button
5. [ ] Observe result

**Expected Results:**
- [ ] Toggle button visible
- [ ] Click changes status immediately
- [ ] Badge appears/disappears ("Inactive")
- [ ] Button text changes (Activate ↔ Deactivate)
- [ ] No page reload required
- [ ] Statistics update
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 2.5: Delete Category
**Goal:** Verify category deletion with confirmation

**Steps:**
1. [ ] Create a test category (or use existing)
2. [ ] Click "Delete" button
3. [ ] Observe confirmation dialog
4. [ ] Click "Cancel" first
5. [ ] Click "Delete" again
6. [ ] Click "OK" to confirm
7. [ ] Observe result

**Expected Results:**
- [ ] Delete button visible (should be cautiously styled)
- [ ] Confirmation dialog appears
- [ ] Confirmation message is clear
- [ ] Cancel works (no deletion)
- [ ] OK/Confirm works (deletion occurs)
- [ ] Category removed from list immediately
- [ ] Statistics update
- [ ] No console errors

**Issue Alert:**
⚠️ **Known UX Issue:** Uses browser confirm() - not ideal but functional

**Pass/Fail:** ___________

---

### Test 2.6: Empty State
**Goal:** Verify empty state when no categories

**Steps:**
1. [ ] Delete all categories (if possible, or use fresh data)
2. [ ] Observe page

**Expected Results:**
- [ ] Empty state message displays
- [ ] "No categories yet" or similar
- [ ] "Create Your First Category" button visible
- [ ] No broken UI
- [ ] Statistics show 0/0/0

**Pass/Fail:** ___________

---

### Test 2.7: Form Validation
**Goal:** Verify required field validation

**Steps:**
1. [ ] Click "+ Add Category"
2. [ ] Leave "Name" field empty
3. [ ] Fill other fields
4. [ ] Try to submit

**Expected Results:**
- [ ] Cannot submit with empty name
- [ ] Validation error shown
- [ ] Error message clear (browser alert or inline)
- [ ] Other fields retain values
- [ ] No server request made

**Pass/Fail:** ___________

---

## Phase 3: Admin Panel - Menu Management (15 minutes)

### Test 3.1: View Menu List
**Goal:** Verify menu page displays correctly

**Steps:**
1. [ ] Navigate to `/admin/menu`
2. [ ] Observe page layout

**Expected Results:**
- [ ] Page loads successfully
- [ ] Menu items displayed (if mock data exists)
- [ ] Filter/search options visible (if implemented)
- [ ] "+ Add Menu Item" button visible
- [ ] Items show: image, name, price, category
- [ ] Clean card/list layout
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 3.2: Create Menu Item
**Goal:** Verify menu item creation

**Steps:**
1. [ ] Click "+ Add Menu Item"
2. [ ] Fill form:
   - Name: "Test Item"
   - Description: "Test Description"
   - Price: 99
   - Category: Select one
   - Available: Toggle ON
3. [ ] Submit
4. [ ] Observe result

**Expected Results:**
- [ ] Form opens
- [ ] All fields render
- [ ] Category dropdown works
- [ ] Price accepts numbers
- [ ] Submit creates item
- [ ] New item appears in list
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 3.3: Edit Menu Item
**Goal:** Verify menu item editing

**Steps:**
1. [ ] Click "Edit" on any menu item
2. [ ] Modify fields
3. [ ] Submit
4. [ ] Observe result

**Expected Results:**
- [ ] Edit modal opens with data
- [ ] Can modify all fields
- [ ] Updates save correctly
- [ ] Changes reflect in list
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 3.4: Delete Menu Item
**Goal:** Verify menu item deletion

**Steps:**
1. [ ] Click "Delete" on a menu item
2. [ ] Confirm deletion
3. [ ] Observe result

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Deletion works
- [ ] Item removed from list
- [ ] No console errors

**Pass/Fail:** ___________

---

## Phase 4: Other Admin Features (30 minutes)

### Test 4.1: Promotions Management
**Steps:**
1. [ ] Navigate to `/admin/promotions`
2. [ ] Test: View list
3. [ ] Test: Create promotion
4. [ ] Test: Edit promotion
5. [ ] Test: Delete promotion
6. [ ] Test: Toggle active

**Expected:** All CRUD operations work similar to categories

**Pass/Fail:** ___________

---

### Test 4.2: Tables Management + QR Codes
**Steps:**
1. [ ] Navigate to `/admin/tables`
2. [ ] Test: View table list
3. [ ] Test: Create table
4. [ ] Test: Generate QR code
5. [ ] Test: Download QR code
6. [ ] Test: View QR code
7. [ ] Test: Delete table

**Expected:**
- [ ] QR codes generate correctly
- [ ] Download works (PNG file)
- [ ] QR contains correct URL

**Pass/Fail:** ___________

---

### Test 4.3: Settings Page
**Steps:**
1. [ ] Navigate to `/admin/settings`
2. [ ] Test: View current settings
3. [ ] Test: Change restaurant name
4. [ ] Test: Switch mode (Restaurant ↔ Market)
5. [ ] Test: Save changes

**Expected:**
- [ ] Settings load
- [ ] Mode switcher works
- [ ] Changes save
- [ ] Sidebar updates (Tables ↔ Queue menu)

**Pass/Fail:** ___________

---

### Test 4.4: Orders Dashboard
**Steps:**
1. [ ] Navigate to `/admin/orders`
2. [ ] Test: View order list
3. [ ] Test: Filter by status
4. [ ] Test: View order details
5. [ ] Test: Update order status

**Expected:**
- [ ] Orders display
- [ ] Filtering works
- [ ] Status updates work

**Pass/Fail:** ___________

---

### Test 4.5: Queue Management (Market Mode)
**Steps:**
1. [ ] Switch to Market Mode in settings
2. [ ] Navigate to `/admin/queue`
3. [ ] Test: View queue list
4. [ ] Test: Update queue status
5. [ ] Test: Complete queue item

**Expected:**
- [ ] Queue displays
- [ ] Status updates work
- [ ] Real-time-ish updates (5 sec)

**Pass/Fail:** ___________

---

## Phase 5: Customer Flow - Menu Browsing (15 minutes)

### Test 5.1: Access Customer Menu (Market Mode)
**Goal:** Verify customer can access menu without login

**Steps:**
1. [ ] Open new incognito window
2. [ ] Navigate to http://localhost:3000/menu?mode=market
3. [ ] Observe page

**Expected Results:**
- [ ] Page loads without login
- [ ] Menu items displayed
- [ ] Categories shown as tabs
- [ ] Search bar visible
- [ ] Cart icon visible
- [ ] No admin content
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 5.2: Browse Menu by Category
**Goal:** Verify category filtering works

**Steps:**
1. [ ] On `/menu?mode=market`
2. [ ] Click different category tabs
3. [ ] Observe filtering

**Expected Results:**
- [ ] Clicking tab filters items
- [ ] Only items from selected category show
- [ ] "All" tab shows everything
- [ ] Smooth transition
- [ ] No page reload

**Pass/Fail:** ___________

---

### Test 5.3: Search Menu Items
**Goal:** Verify search functionality

**Steps:**
1. [ ] Type in search box: "ไก่" or "chicken"
2. [ ] Observe results
3. [ ] Clear search
4. [ ] Observe results

**Expected Results:**
- [ ] Search filters items in real-time
- [ ] Results match search term
- [ ] Search works in Thai and English
- [ ] Clear search shows all items
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 5.4: View Menu Item Details
**Goal:** Verify menu item modal

**Steps:**
1. [ ] Click on any menu item card
2. [ ] Modal opens
3. [ ] Observe content

**Expected Results:**
- [ ] Modal opens smoothly
- [ ] Item details displayed
- [ ] Image, name, description, price visible
- [ ] Quantity selector visible
- [ ] "Add to Cart" button visible
- [ ] Can close modal
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 5.5: Add Items to Cart
**Goal:** Verify cart functionality

**Steps:**
1. [ ] Open menu item modal
2. [ ] Set quantity to 2
3. [ ] Add special notes (if available)
4. [ ] Click "Add to Cart"
5. [ ] Observe cart icon
6. [ ] Add more items

**Expected Results:**
- [ ] Item added to cart
- [ ] Cart icon shows count badge
- [ ] Count increases with each add
- [ ] Modal closes after add
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 5.6: View Cart
**Goal:** Verify cart modal displays correctly

**Steps:**
1. [ ] Add items to cart (Test 5.5)
2. [ ] Click cart icon
3. [ ] Observe cart modal

**Expected Results:**
- [ ] Cart modal opens
- [ ] All added items displayed
- [ ] Quantities correct
- [ ] Prices correct
- [ ] Subtotal calculated
- [ ] Can adjust quantities
- [ ] Can remove items
- [ ] "Checkout" or "Place Order" button visible
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 5.7: Adjust Cart Quantities
**Goal:** Verify quantity adjustment in cart

**Steps:**
1. [ ] Open cart modal
2. [ ] Increase quantity of item
3. [ ] Decrease quantity of item
4. [ ] Set quantity to 0 (should remove)
5. [ ] Observe results

**Expected Results:**
- [ ] Quantity buttons work
- [ ] Subtotal updates immediately
- [ ] Setting to 0 removes item
- [ ] Cart count badge updates
- [ ] No console errors

**Pass/Fail:** ___________

---

## Phase 6: Customer Flow - Order Placement (15 minutes)

### Test 6.1: Checkout - Market Mode
**Goal:** Verify order placement in market mode

**Steps:**
1. [ ] Add items to cart
2. [ ] Click "Checkout" or "Place Order"
3. [ ] Fill customer information form:
   - Name
   - Phone
   - (Other fields if present)
4. [ ] Submit order
5. [ ] Observe result

**Expected Results:**
- [ ] Checkout modal/page opens
- [ ] Customer info form displayed
- [ ] Order summary shown
- [ ] Can submit order
- [ ] Success confirmation
- [ ] Redirected to queue ticket page
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 6.2: Queue Ticket Display
**Goal:** Verify queue ticket shows correctly

**Steps:**
1. [ ] After placing order (Test 6.1)
2. [ ] Observe queue ticket page
3. [ ] URL should be `/queue/[queueId]`

**Expected Results:**
- [ ] Queue number displayed (e.g., Q042)
- [ ] QR code displayed
- [ ] Order details shown
- [ ] Status shown
- [ ] "Copy Link" button visible
- [ ] "Download QR" button visible
- [ ] Queue position shown ("X people ahead")
- [ ] Clean, mobile-friendly design
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 6.3: Copy Queue Link
**Goal:** Verify copy link functionality

**Steps:**
1. [ ] On queue ticket page
2. [ ] Click "Copy Link" button
3. [ ] Observe feedback
4. [ ] Paste in new tab (Cmd+V or Ctrl+V)
5. [ ] Navigate to pasted URL

**Expected Results:**
- [ ] Copy button works
- [ ] Success feedback shown (e.g., "คัดลอกแล้ว")
- [ ] Link copies to clipboard
- [ ] Pasted link is correct URL
- [ ] Navigating to link loads same ticket
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 6.4: Download QR Code
**Goal:** Verify QR code download

**Steps:**
1. [ ] On queue ticket page
2. [ ] Click "Download QR" button
3. [ ] Observe download
4. [ ] Check downloaded file

**Expected Results:**
- [ ] Download triggers
- [ ] File downloads (PNG format)
- [ ] File name makes sense
- [ ] QR code image clear
- [ ] QR code scans correctly (use phone camera)
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 6.5: Queue Status Updates
**Goal:** Verify real-time-ish status updates

**Steps:**
1. [ ] Stay on queue ticket page
2. [ ] Wait 10 seconds (polling is 5 sec)
3. [ ] Observe status
4. [ ] (Optional) Update status in admin panel
5. [ ] Wait for refresh

**Expected Results:**
- [ ] Page checks for updates automatically
- [ ] Status updates without manual refresh
- [ ] Queue position updates
- [ ] "People ahead" count updates
- [ ] Smooth updates (no flashing)
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 6.6: Queue Recovery on Revisit
**Goal:** Verify localStorage queue recovery

**Steps:**
1. [ ] Place order and get queue ticket
2. [ ] Close browser tab
3. [ ] Navigate to `/menu?mode=market` again
4. [ ] Observe behavior

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Message mentions existing queue
- [ ] Queue number shown
- [ ] "Continue" option available
- [ ] Clicking "Continue" goes to queue ticket
- [ ] Clicking "Cancel" stays on menu
- [ ] No console errors

**Pass/Fail:** ___________

---

### Test 6.7: Restaurant Mode (with Table)
**Goal:** Verify restaurant mode order flow

**Steps:**
1. [ ] Navigate to `/menu?table=1` (or table=2, 3, etc.)
2. [ ] Add items to cart
3. [ ] Place order
4. [ ] Observe result

**Expected Results:**
- [ ] Menu loads with table parameter
- [ ] Cart works same as market mode
- [ ] Order includes table number
- [ ] Success confirmation shown
- [ ] No queue ticket (restaurant mode)
- [ ] Redirected to success/tracking page
- [ ] No console errors

**Pass/Fail:** ___________

---

## Phase 7: Mobile Testing (60 minutes - CRITICAL!)

**Priority:** HIGH - Most customers use mobile devices

### Devices to Test

**iOS (Required):**
- [ ] iPhone (any model, iOS 15+)
- [ ] Safari browser

**Android (Required):**
- [ ] Android phone (any model, Android 10+)
- [ ] Chrome browser

---

### Test 7.1: Mobile - Login Page
**Device:** iOS Safari | Android Chrome

**Steps:**
1. [ ] Navigate to `/admin/login` on mobile
2. [ ] Observe layout

**Expected Results:**
- [ ] Page fits screen (no horizontal scroll)
- [ ] Text readable without zoom
- [ ] Password field tappable
- [ ] Login button tappable (44px+ height)
- [ ] Keyboard pops up when tapping input
- [ ] Can submit with keyboard "Go" button
- [ ] Layout doesn't break

**Pass/Fail:** ___________

---

### Test 7.2: Mobile - Admin Sidebar
**Device:** iOS Safari | Android Chrome

**Steps:**
1. [ ] Login on mobile
2. [ ] Observe sidebar

**Expected Results:**
- [ ] Sidebar visible or hamburger menu
- [ ] Navigation usable
- [ ] All menu items accessible
- [ ] Logout button accessible
- [ ] No overlapping content
- [ ] Theme switcher works

**Pass/Fail:** ___________

---

### Test 7.3: Mobile - Category Management
**Device:** iOS Safari | Android Chrome

**Steps:**
1. [ ] Navigate to `/admin/categories` on mobile
2. [ ] Test: View list
3. [ ] Test: Create category
4. [ ] Test: Edit category
5. [ ] Test: Delete category

**Expected Results:**
- [ ] Cards stack vertically
- [ ] All buttons tappable
- [ ] Modal fits screen
- [ ] Form fields usable
- [ ] Keyboard doesn't cover inputs
- [ ] No layout breaks

**Pass/Fail:** ___________

---

### Test 7.4: Mobile - Customer Menu
**Device:** iOS Safari | Android Chrome

**Steps:**
1. [ ] Navigate to `/menu?mode=market` on mobile
2. [ ] Browse menu
3. [ ] Add items to cart
4. [ ] View cart

**Expected Results:**
- [ ] Menu items displayed well
- [ ] Images load and scale properly
- [ ] Category tabs usable
- [ ] Search bar usable
- [ ] Cards tappable
- [ ] Cart modal fits screen
- [ ] Smooth scrolling
- [ ] No horizontal scroll

**Pass/Fail:** ___________

---

### Test 7.5: Mobile - Order Placement
**Device:** iOS Safari | Android Chrome

**Steps:**
1. [ ] Add items to cart
2. [ ] Checkout
3. [ ] Fill form
4. [ ] Submit order

**Expected Results:**
- [ ] Form fields tappable
- [ ] Keyboard doesn't hide submit button
- [ ] Can scroll if needed
- [ ] Submit button accessible
- [ ] No layout issues

**Pass/Fail:** ___________

---

### Test 7.6: Mobile - Queue Ticket
**Device:** iOS Safari | Android Chrome

**Steps:**
1. [ ] Place order
2. [ ] View queue ticket
3. [ ] Test copy link
4. [ ] Test download QR

**Expected Results:**
- [ ] Queue number large and visible
- [ ] QR code displays clearly
- [ ] QR code scannable with camera
- [ ] Copy button works
- [ ] Download works on mobile
- [ ] Status updates work
- [ ] Readable without zoom

**Pass/Fail:** ___________

---

### Test 7.7: Mobile - Performance
**Device:** iOS Safari | Android Chrome

**Steps:**
1. [ ] Navigate through app
2. [ ] Observe loading times
3. [ ] Test scrolling smoothness

**Expected Results:**
- [ ] Pages load in <3 seconds
- [ ] Smooth scrolling (60fps)
- [ ] No janky animations
- [ ] Images load progressively
- [ ] No white screen flashes
- [ ] Responsive interactions

**Pass/Fail:** ___________

---

### Test 7.8: Mobile - Landscape Mode
**Device:** iOS Safari | Android Chrome

**Steps:**
1. [ ] Rotate device to landscape
2. [ ] Navigate admin panel
3. [ ] Navigate customer menu

**Expected Results:**
- [ ] Layout adapts to landscape
- [ ] No broken layouts
- [ ] Content accessible
- [ ] Usable in landscape

**Pass/Fail:** ___________

---

## Phase 8: Cross-Browser Testing (30 minutes)

### Desktop Browsers

#### Test 8.1: Chrome
- [ ] Auth flow works
- [ ] Admin CRUD works
- [ ] Customer flow works
- [ ] No console errors
- [ ] DevTools shows no issues

**Pass/Fail:** ___________

---

#### Test 8.2: Firefox
- [ ] Auth flow works
- [ ] Admin CRUD works
- [ ] Customer flow works
- [ ] No console errors
- [ ] DevTools shows no issues

**Pass/Fail:** ___________

---

#### Test 8.3: Safari (macOS)
- [ ] Auth flow works
- [ ] Admin CRUD works
- [ ] Customer flow works
- [ ] No console errors
- [ ] Web Inspector shows no issues

**Pass/Fail:** ___________

---

#### Test 8.4: Edge (Optional)
- [ ] Auth flow works
- [ ] Admin CRUD works
- [ ] Customer flow works

**Pass/Fail:** ___________

---

## Phase 9: Edge Cases & Error Handling (30 minutes)

### Test 9.1: Network Errors
**Steps:**
1. [ ] Open DevTools → Network tab
2. [ ] Set throttling to "Offline"
3. [ ] Try to login
4. [ ] Try to load menu
5. [ ] Observe error handling

**Expected Results:**
- [ ] Graceful error messages
- [ ] No ugly errors
- [ ] Clear user communication
- [ ] Can retry when back online

**Pass/Fail:** ___________

---

### Test 9.2: Invalid URLs
**Steps:**
1. [ ] Navigate to `/admin/invalidpage`
2. [ ] Navigate to `/menu?table=999`
3. [ ] Navigate to `/queue/invalid-id`

**Expected Results:**
- [ ] 404 page or graceful error
- [ ] Not broken layouts
- [ ] Can navigate back

**Pass/Fail:** ___________

---

### Test 9.3: Empty States
**Steps:**
1. [ ] View empty category list
2. [ ] View empty menu list
3. [ ] View empty cart
4. [ ] View empty order list

**Expected Results:**
- [ ] Clear empty state messages
- [ ] Actionable suggestions
- [ ] No broken UI
- [ ] Helpful CTAs

**Pass/Fail:** ___________

---

### Test 9.4: Long Content
**Steps:**
1. [ ] Create category with very long name
2. [ ] Create menu item with long description
3. [ ] Observe layout

**Expected Results:**
- [ ] Text wraps correctly
- [ ] No overflow issues
- [ ] Layout doesn't break
- [ ] Truncation if needed

**Pass/Fail:** ___________

---

### Test 9.5: Special Characters
**Steps:**
1. [ ] Create category with Thai characters
2. [ ] Create menu with special chars: @#$%
3. [ ] Create menu with emojis
4. [ ] Observe behavior

**Expected Results:**
- [ ] Thai characters work
- [ ] Special chars accepted
- [ ] Emojis display correctly
- [ ] No encoding issues

**Pass/Fail:** ___________

---

### Test 9.6: Session Expiration
**Steps:**
1. [ ] Login to admin
2. [ ] Wait for token expiration (7 days - not practical)
3. [ ] OR manually delete session cookie
4. [ ] Try to access admin page

**Expected Results:**
- [ ] Redirected to login
- [ ] No error messages
- [ ] Can login again
- [ ] Session restored

**Pass/Fail:** ___________

---

## Phase 10: Known Issues Verification (15 minutes)

**Based on QA Report Findings**

### Issue #1: Browser alert() and confirm()
**Location:** Category delete, order placement, etc.

**Expected Behavior:**
- [ ] Confirmation uses browser confirm()
- [ ] Alert uses browser alert()
- [ ] Functional but not ideal

**Verification:**
- [ ] Works on all browsers
- [ ] Mobile works but UX poor
- [ ] Documented for future improvement

**Pass/Fail:** ___________

---

### Issue #2: Emoji Icons in Admin
**Location:** Sidebar navigation

**Expected Behavior:**
- [ ] Emojis used for icons (📊, 📁, 🍽️, etc.)
- [ ] Visible on all platforms
- [ ] May look different per OS

**Verification:**
- [ ] iOS displays emojis
- [ ] Android displays emojis
- [ ] Windows displays emojis
- [ ] macOS displays emojis
- [ ] Documented for future improvement

**Pass/Fail:** ___________

---

### Issue #3: 5-Second Polling (Not Real-time)
**Location:** Queue ticket page

**Expected Behavior:**
- [ ] Status updates every 5 seconds
- [ ] Not immediate real-time
- [ ] Acceptable for MVP

**Verification:**
- [ ] Polling works
- [ ] No infinite loops
- [ ] No performance issues

**Pass/Fail:** ___________

---

## Testing Summary

### Overall Statistics
- **Total Tests:** ~80
- **Tests Passed:** _____ / 80
- **Tests Failed:** _____ / 80
- **Tests Partial:** _____ / 80
- **Critical Issues:** _____
- **Major Issues:** _____
- **Minor Issues:** _____

### Pass Rate
- **Auth Flow:** _____ %
- **Admin Panel:** _____ %
- **Customer Flow:** _____ %
- **Mobile:** _____ %
- **Overall:** _____ %

### Recommendations
- [ ] Ready for production (80%+ pass rate, no critical issues)
- [ ] Needs fixes (60-80% pass rate, some critical issues)
- [ ] Needs major work (<60% pass rate, many issues)

---

## Bug Report Template

**Use this template for each bug found:**

---

### Bug #___: [Short Title]

**Severity:** Critical | Major | Minor

**Frequency:** Always | Sometimes | Rare

**Location:**
- Page/Route:
- Component:
- Browser:
- Device:

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Actual Behavior:**


**Screenshot/Video:**
(Attach if possible)

**Console Errors:**
```
(Paste console errors here)
```

**Impact:**
- [ ] Blocks core functionality
- [ ] Degrades user experience
- [ ] Visual only
- [ ] Edge case

**Suggested Fix:**


**Related Code:**
- File:
- Line:

---

## Post-Testing Actions

### After Testing Complete:
1. [ ] Compile all bug reports
2. [ ] Prioritize issues (Critical → Major → Minor)
3. [ ] Create issues in project tracker
4. [ ] Share findings with team
5. [ ] Update QA reports
6. [ ] Retest after fixes

### Create Summary Report:
- [ ] Overall pass rate
- [ ] Critical blockers list
- [ ] Deployment recommendation
- [ ] Risk assessment

---

## Notes & Observations

**General Observations:**
(Add notes about overall quality, performance, UX, etc.)





**Positive Highlights:**
(What worked really well?)





**Areas for Improvement:**
(Beyond specific bugs, what could be better?)





**User Experience Notes:**
(How did it feel to use? Intuitive? Confusing?)





---

**Testing Completed By:** _______________
**Date:** _______________
**Time Spent:** _______________
**Sign-off:** _______________

---

**End of Manual Testing Checklist**

For questions or issues with this checklist, contact: qa-devops
