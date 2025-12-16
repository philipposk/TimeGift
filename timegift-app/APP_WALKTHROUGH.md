# 🎁 TimeGift - Complete App Walkthrough

## What is TimeGift?

**TimeGift** is a web application that lets you **gift your personal time** to others with a heartfelt message. Instead of giving material gifts, you commit a specific amount of your time (e.g., "2 hours", "1 day") to spend with someone.

### The Core Concept

Imagine you want to give your cousin a meaningful gift, but nothing material feels right. TimeGift lets you create a **time gift** - a commitment to spend, say, 3 hours doing whatever they want. They receive a beautiful card with your message and can redeem it when they're ready.

---

## 🎯 How It Works - Step by Step

### 1. **User Signs Up / Signs In**
- Users create an account with email/password or Google OAuth
- They set up a profile with username, display name, and avatar
- Privacy settings: closed, friends-only, or public

### 2. **Create a Time Gift**
- Click "Create Time Gift" on the dashboard
- **Step 1 - Choose Recipient:**
  - Send to email address (works even if they don't have an account!)
  - Send to phone number
  - Send to a friend (if they're in your friends list)
  
- **Step 2 - Set Time & Message:**
  - Choose amount: minutes, hours, or days (e.g., "2 hours", "1 day")
  - Write a heartfelt message
  - Choose purpose: "anything" or "specific activity"
  - Optionally upload a photo card (handwritten note, etc.)
  - Set expiry date (optional)

- **Step 3 - Set Availability:**
  - Open availability (recipient picks time)
  - Or specify your available time slots

### 3. **Recipient Receives Gift**
- If sent to email/phone: They get a notification (SMS, WhatsApp, or email)
- If they have an account: Gift appears in their dashboard
- They see your message, the time amount, and can accept it

### 4. **Accept & Schedule**
- Recipient clicks "Accept Gift"
- They can optionally schedule a specific date/time
- Gift status changes: `pending` → `accepted` → `scheduled` → `completed`

### 5. **Spend Time Together**
- When the scheduled time arrives, both parties get reminders
- They spend the time together doing whatever was planned
- After, the gift can be marked as "completed"

---

## 🌟 Key Features

### **Dashboard**
- Overview of all your gifts (sent and received)
- Statistics: total hours gifted/received, pending gifts, completed gifts
- Quick actions: create gift, manage friends

### **Friends System**
- Search for users by username or name
- Send friend requests
- Mutual acceptance required
- Privacy-aware: only see friends who allow it

### **Time Decay (Admin Feature)**
- If a gift isn't accepted within a grace period, it starts to "decay"
- Time amount gradually decreases (e.g., 5% per week)
- Encourages recipients to accept gifts promptly
- Admin can configure decay rate and intervals

### **Random Gift Exchange**
- Users can opt-in to random matching
- System pairs users who want to exchange time gifts
- Creates mutual gifts automatically
- Great for meeting new people!

### **Notifications**
- SMS via Vonage (optional)
- WhatsApp messages (optional)
- Email notifications
- In-app alerts
- Creative rotating reminder messages

### **Admin Panel**
- Configure time decay settings
- Set notification preferences
- Manage API keys (Vonage, Groq, WhatsApp)
- Theme customization
- Feature toggles

---

## 📱 User Flow Examples

### Example 1: Birthday Gift
1. **Sarah** wants to give her friend **Mike** a birthday gift
2. She creates a "3 hours" time gift with message: "Happy birthday! Let's spend an afternoon doing whatever you want - your choice!"
3. She sends it to Mike's email: `mike@example.com`
4. Mike receives an email notification
5. Mike signs up (or signs in if he has an account)
6. He sees the gift in his dashboard and accepts it
7. They schedule it for the following Saturday afternoon
8. On Saturday, both get reminders
9. They spend 3 hours together (maybe going to a museum, having lunch, etc.)
10. After, the gift is marked "completed"

### Example 2: Random Exchange
1. **Alex** opts into random gift exchange
2. **Jordan** also opts in
3. System matches them automatically
4. Both receive a "1 hour" time gift from each other
5. They can accept and schedule to meet up
6. Great way to meet new people!

### Example 3: Family Time
1. **Mom** creates a "1 day" time gift for her daughter
2. Message: "Let's spend a whole day together - just us. Your choice of activities!"
3. Daughter accepts and schedules it for next month
4. They spend the day together doing daughter's favorite activities

---

## 🎨 UI/UX Features

- **Beautiful Design:** Modern gradient backgrounds, smooth animations
- **Dark/Light Mode:** Toggle between themes
- **Responsive:** Works on mobile, tablet, desktop
- **Accessible:** Keyboard navigation, ARIA labels
- **Loading States:** Clear feedback during operations
- **Error Handling:** Graceful error messages

---

## 🔐 Privacy & Security

- **Privacy Levels:**
  - **Closed:** Only you can see your profile
  - **Friends-only:** Only friends can see your profile
  - **Public:** Anyone can see your profile

- **Friend System:** Mutual acceptance required
- **Opt-in Features:** Random exchange, accepting gifts from strangers
- **Secure Authentication:** Firebase Auth with OAuth support

---

## 📊 Statistics & Tracking

Users can see:
- Total hours gifted
- Total hours received
- Number of pending gifts
- Number of completed gifts
- Gift history (sent and received)

---

## 🚀 Technical Details

- **Framework:** Next.js 15 (React)
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage (for photo cards)
- **Styling:** Tailwind CSS
- **Language:** TypeScript

---

## 💡 The Philosophy

TimeGift is built on the idea that **time is the most precious gift**. In a world full of material things, committing your presence and attention to someone is meaningful and intentional.

The app makes this concept:
- **Tangible:** Specific time amounts, not vague promises
- **Trackable:** See your impact, manage commitments
- **Beautiful:** Thoughtful UI, heartfelt messages
- **Flexible:** Works for friends, family, or strangers (opt-in)

---

## 🎯 Use Cases

- **Birthday gifts:** "3 hours of my time, your choice!"
- **Thank you gifts:** "2 hours to help you with your project"
- **Family time:** "1 day together, just us"
- **Random kindness:** Opt-in to exchange time with strangers
- **Friend support:** "I'm here for you, 4 hours whenever you need"

---

This is TimeGift - making the gift of time meaningful, intentional, and beautiful! 🎁
