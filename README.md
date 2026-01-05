# 📞💬 WebRTC Phone + Messaging v2.2

A self-hosted, encrypted calling **AND** messaging system with authentication, MySQL persistence, and PWA support.

## ✨ Features

- **📞 Voice Calling** - WebRTC browser-to-browser calls
- **📹 Video Calling** - Full video support
- **💬 Real-time Messaging** - Instant chat with history
- **🎤 Voice Messages** - Hold to record, release to send
- **📎 File Sharing** - Images, PDFs, documents
- **✓✓ Read Receipts** - See when messages are read
- **📧 Email Contact Form** - Pre-filled email composer
- **📱 Dial Pad** - Call any number from dashboard
- **🌐 SIP Calling** - Free SIP-to-SIP calls
- **☎️ Twilio Integration** - Call real phone numbers
- **🔐 Authentication** - Password-protected owner dashboard
- **🗄️ MySQL Storage** - Persistent message history
- **🔔 Push Notifications** - Even when browser is closed
- **📱 PWA Support** - Install as mobile app

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VISITOR                                   │
│                           │                                      │
│     ┌─────────┬───────────┼───────────┬──────────┐              │
│     │         │           │           │          │              │
│  [Voice]  [Video]    [Message]    [Email]   [Call Me]           │
│     │         │           │           │          │              │
│     └─────────┴───────────┼───────────┴──────────┘              │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   YOUR SERVER                             │   │
│  │                                                           │   │
│  │   Node.js + Socket.IO + Express                          │   │
│  │         │                                                 │   │
│  │         ├── WebRTC Signaling (voice/video)               │   │
│  │         ├── Real-time Messaging                          │   │
│  │         ├── Twilio API (PSTN calls) ─────► Real Phones   │   │
│  │         ├── SIP Integration ─────────────► SIP Users     │   │
│  │         └── REST API (auth, messages)                    │   │
│  │                    │                                      │   │
│  │              ┌─────┴─────┐                                │   │
│  │              │   MySQL   │                                │   │
│  │              └───────────┘                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│              ┌────────────┴────────────┐                        │
│              ▼                         ▼                        │
│       [Push Notif]              [Email Alert]                   │
│              │                         │                        │
│              └────────────┬────────────┘                        │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              OWNER DASHBOARD (PWA)                        │   │
│  │   • Answer calls        • Send messages                  │   │
│  │   • Dial pad            • Voice messages                 │   │
│  │   • SIP/Twilio calls    • File sharing                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **HTTPS** - Required for WebRTC
- **Node.js 18+**
- **MySQL 8+** or MariaDB

### Installation

```bash
# Clone
git clone https://github.com/yourusername/webrtc-phone.git
cd webrtc-phone

# Install dependencies
npm install
npm install bitcoinjs-message
npm install bsv
npm install bitcoinjs-message@2.2.0 bsv@2.0.0 @solana/web3.js@1.87.6 tweetnacl@1.0.3 bs58@5.0.0 bitcore-lib-cash@10.0.0

# Set up database
mysql -u root -p < database/schema.sql

# Configure
cp .env.example .env
nano .env

# Create owner account
npm run create-owner

# Start
npm start
```

### Access

| Page | URL |
|------|-----|
| Visitor | `https://your-domain.com/` |
| Login | `https://your-domain.com/login` |
| Dashboard | `https://your-domain.com/owner` |

## ☎️ Calling Options

The owner dashboard has a **Dial Pad** with three calling modes:

### Option 1: 📱 Device Dialer (Free - Default)

Uses `tel:` links to open your phone's native dialer. No configuration needed.

- ✅ Free forever
- ✅ Uses your phone's minutes
- ✅ No setup required
- ❌ Requires a phone with dialer

### Option 2: 🌐 SIP Calling (Free)

Call other SIP users for free, directly from the browser.

1. Register at [sip2sip.info](https://sip2sip.info) (free)
2. Add to `.env`:

```env
SIP_SERVER=sip2sip.info
SIP_USERNAME=your_sip_username
SIP_PASSWORD=your_sip_password
```

- ✅ Completely free
- ✅ Browser-based (no phone needed)
- ✅ Encrypted
- ❌ Can only call other SIP addresses

### Option 3: ☎️ Twilio (Paid - Real Phone Numbers)

Call any phone number worldwide from your browser.

1. Sign up at [twilio.com](https://twilio.com) (free trial with $15 credit)
2. Buy a phone number (~$1/month)
3. Add to `.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

4. Install SDK:

```bash
npm install twilio
```

**Pricing:** 
- US/Canada: ~$0.013/min
- International: Varies by country
- Free trial: ~500 minutes

⚠️ **NEVER share your Twilio credentials publicly!**

## 🔧 Configuration

### Full `.env` Example

```env
# =============================================================================
# SERVER
# =============================================================================
PORT=3000
DOMAIN=your-domain.com
SESSION_SECRET=generate-a-random-32-character-string-here

# =============================================================================
# DATABASE (Required)
# =============================================================================
MYSQL_HOST=localhost
MYSQL_USER=webrtc
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=webrtc_phone

# =============================================================================
# OWNER
# =============================================================================
OWNER_EMAIL=your@email.com

# =============================================================================
# PUSH NOTIFICATIONS (Optional)
# =============================================================================
# Generate with: npm run generate-vapid
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=mailto:your@email.com

# =============================================================================
# EMAIL NOTIFICATIONS (Optional)
# =============================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

# =============================================================================
# TWILIO - Call Real Phones (Optional)
# =============================================================================
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# =============================================================================
# SIP - Free Calls (Optional)
# =============================================================================
SIP_SERVER=sip2sip.info
SIP_USERNAME=
SIP_PASSWORD=
```

### Generate Secrets

```bash
# Session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# VAPID keys
npm run generate-vapid
```

## 🚀 Deployment

### With Cloudflare Tunnel (Recommended)

```bash
# Terminal 1 - Start server
npm start

# Terminal 2 - Create tunnel
cloudflared tunnel --url http://localhost:3000
```

Or configure a permanent tunnel in Cloudflare dashboard.

### With systemd (Production)

Create `/etc/systemd/system/webrtc-phone.service`:

```ini
[Unit]
Description=WebRTC Phone
After=network.target mysql.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/webrtc-phone
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable webrtc-phone
sudo systemctl start webrtc-phone
sudo systemctl status webrtc-phone
```

## 📁 Project Structure

```
webrtc-phone/
├── server.js              # Main server
├── package.json
├── .env                   # Configuration (DO NOT COMMIT!)
├── .env.example           # Example configuration
├── database/
│   └── schema.sql         # MySQL schema
├── scripts/
│   └── create-owner.js    # Account management
├── uploads/               # Voice messages, images, files
└── public/
    ├── index.html         # Visitor page
    ├── login.html         # Login page  
    ├── owner.html         # Owner dashboard
    ├── sw.js              # Service worker
    ├── manifest.json      # PWA manifest
    └── icon-*.png         # App icons
```
## Supported Chains

| Chain | Connect Method | Generate On-Site |
|-------|---------------|------------------|
| **₿ Bitcoin (BTC)** | Manual signature | ✅ Yes |
| **Ƀ BSV** | Manual signature | ✅ Yes |
| **Ƀ BCH** | Manual signature | ✅ Yes |
| **◎ Solana (SOL)** | Phantom wallet | ❌ No (use Phantom) |
| **⚡ Lightning** | Alby (WebLN) | ❌ No (use Alby) |

## Features

### 1. Connect Existing Wallet
- Sign a message with your wallet to verify ownership
- Works with any wallet that supports message signing
- For SOL/Lightning: browser extensions auto-connect

### 2. Generate New Wallet (On-Site)
- Create a fresh BTC, BSV, or BCH wallet instantly
- Private key is generated securely and shown ONCE
- User must save the key themselves (we never store it)
- Includes download backup feature

### 3. Verification Badge
- Verified users display a badge with chain icon
- Short address shown (e.g., `1ABC...XYZ`)
- Owner can see verification status in dashboard


## API Endpoints

### Generate Wallet
```
POST /api/wallet/generate
Body: { "chain": "btc" | "bsv" | "bch" }

Response:
{
  "success": true,
  "chain": "btc",
  "address": "1ABC...",
  "privateKey": "5J...", // WIF format - SAVE THIS!
  "publicKey": "02...",
  "warning": "SAVE YOUR PRIVATE KEY NOW!"
}
```

### Verify Signature
```
POST /api/wallet/verify
Body: {
  "chain": "btc",
  "address": "1ABC...",
  "message": "Verify identity for HomeBase...",
  "signature": "...",
  "visitorId": "uuid..." // optional
}

Response:
{
  "verified": true,
  "chain": "btc",
  "address": "1ABC...",
  "shortAddress": "1ABC...XYZ"
}
```

### Get Verification Message
```
GET /api/wallet/message

Response:
{
  "message": "Verify identity for HomeBase\nTimestamp: ...\nNonce: ...",
  "timestamp": "2026-01-04T...",
  "nonce": "abc123..."
}
```

### Check Wallet Status
```
GET /api/wallet/status/:visitorId

Response:
{
  "verified": true,
  "address": "1ABC...",
  "chain": "btc",
  "verifiedAt": "2026-01-04T..."
}
```

## User Flow

### Connect Existing Wallet

```
┌──────────────────────────────────────────────────┐
│  [🔓 Identity Unverified]  [Verify Wallet]       │
└──────────────────────────────────────────────────┘
                    │
                    ▼ Click "Verify Wallet"
┌──────────────────────────────────────────────────┐
│         🔐 Verify Your Identity                  │
│                                                  │
│  [Connect Wallet]  [Generate New]                │
│                                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ ₿   │ │ ⚡  │ │ Ƀ   │ │ Ƀ   │ │ ◎   │       │
│  │ BTC │ │ LN  │ │ BSV │ │ BCH │ │ SOL │       │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘       │
└──────────────────────────────────────────────────┘
                    │
                    ▼ Select chain
┌──────────────────────────────────────────────────┐
│         Sign Message                             │
│                                                  │
│  Copy this message, sign in your wallet:         │
│  ┌────────────────────────────────────────┐     │
│  │ Verify identity for HomeBase           │     │
│  │ Timestamp: 2026-01-04T12:00:00Z        │     │
│  │ Nonce: abc123                          │     │
│  └────────────────────────────────────────┘     │
│                                                  │
│  Your Address: [________________]                │
│  Signature:    [________________]                │
│                                                  │
│  [Back]                      [Verify]            │
└──────────────────────────────────────────────────┘
                    │
                    ▼ Success
┌──────────────────────────────────────────────────┐
│  [✅ Verified]  [1ABC...XYZ]  [BTC]         [×]  │
└──────────────────────────────────────────────────┘
```

### Generate New Wallet

```
┌──────────────────────────────────────────────────┐
│         🔐 Verify Your Identity                  │
│                                                  │
│  [Connect Wallet]  [Generate New] ← active       │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │ ₿  Generate BTC Wallet                 │     │
│  └────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────┐     │
│  │ Ƀ  Generate BSV Wallet                 │     │
│  └────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────┐     │
│  │ Ƀ  Generate BCH Wallet                 │     │
│  └────────────────────────────────────────┘     │
└──────────────────────────────────────────────────┘
                    │
                    ▼ Click generate
┌──────────────────────────────────────────────────┐
│         🎉 Wallet Generated!                     │
│         ⚠️ SAVE YOUR PRIVATE KEY NOW!           │
│                                                  │
│  Chain:       BTC                                │
│  Address:     1ABC...XYZ              [📋]       │
│  Private Key: 5J... (blurred)    [📋] [👁️]      │
│  Public Key:  02...                              │
│                                                  │
│  🔐 This private key will NEVER be shown again! │
│                                                  │
│  [Download Backup]    [I've Saved My Key]        │
└──────────────────────────────────────────────────┘
```

## Security Notes

### Private Keys
- ⚠️ Private keys are generated server-side but NEVER stored
- They are returned to the client ONCE and must be saved by the user
- For maximum security, consider client-side generation (see Advanced section)

### Signature Verification
- Currently uses simplified verification for demo
- For production, implement proper cryptographic verification using:
  - `bitcoinjs-message` for BTC
  - `bsv` library for BSV
  - `@solana/web3.js` + `tweetnacl` for SOL

### Storage
- Verification status is stored in localStorage on client
- Wallet address/chain is stored in database (no private keys)
- Users can disconnect/reconnect anytime

## Advanced: Client-Side Key Generation

For maximum security, generate keys client-side using Web Crypto API or dedicated libraries:

```javascript
// Example with bitcoinjs-lib (would need to bundle)
import * as bitcoin from 'bitcoinjs-lib';

function generateBTCWalletClientSide() {
  const keyPair = bitcoin.ECPair.makeRandom();
  const { address } = bitcoin.payments.p2pkh({ 
    pubkey: keyPair.publicKey 
  });
  
  return {
    address,
    privateKey: keyPair.toWIF(),
    publicKey: keyPair.publicKey.toString('hex')
  };
}
```
## Future Enhancements

- [ ] Add QR codes for generated wallets
- [ ] Implement proper signature verification per chain
- [ ] Add support for hardware wallets (Ledger, Trezor)
- [ ] Add wallet balance display
- [ ] Enable tipping/payments via wallet
- [ ] Add ENS/BSV handle resolution

## Troubleshooting

### "Wallet not found" for Phantom/Alby
- Make sure the extension is installed
- Allow the extension to connect to your site
- Try refreshing the page

### Signature verification fails
- Make sure you're signing the exact message shown
- Some wallets add prefixes - try the "manual" option

### Generated wallet doesn't work
- Make sure you saved the private key correctly
- The WIF format starts with '5' for mainnet BTC
- Try importing into a wallet like Electrum to verify

  
## 🔐 Security

| Feature | Implementation |
|---------|---------------|
| Password Storage | bcrypt with salt rounds |
| Sessions | Secure HTTP-only cookies + MySQL |
| WebRTC Media | DTLS-SRTP (end-to-end encrypted) |
| Transport | TLS/HTTPS required |
| API Credentials | Server-side only, stored in .env |

### Security Best Practices

1. ✅ **Never commit `.env`** - Add to `.gitignore`
2. ✅ **Regenerate credentials** if accidentally exposed
3. ✅ **Use HTTPS** - Required for WebRTC anyway
4. ✅ **Strong session secret** - Random 32+ characters
5. ✅ **MySQL user permissions** - Limit to webrtc_phone database only

## 🐛 Troubleshooting

### Database connection failed

```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u webrtc -p webrtc_phone -e "SELECT 1"

# Check .env credentials match
cat .env | grep MYSQL
```

### Push notifications not working

1. Must be on **HTTPS**
2. VAPID keys configured in `.env`?
3. Browser notifications enabled?
4. Service worker registered?

### Twilio calls failing

1. Check credentials in `.env`
2. Do you have a Twilio phone number?
3. Check [Twilio Console](https://console.twilio.com) for error logs
4. Verify account has credit

### Video not showing

1. Must be on **HTTPS**
2. Camera permission granted in browser?
3. Check browser console for errors (F12)
4. Try different browser

### Buttons not enabling

1. Did you enter a name in the input field?
2. Check browser console for JavaScript errors
3. Socket.IO connected? (look for "Connected" in console)

## 📝 API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/config` | ICE servers + VAPID key |
| `POST` | `/api/visitor/register` | Register/get visitor ID |
| `POST` | `/api/messages/send` | Send text message |
| `POST` | `/api/messages/upload` | Upload file/voice |
| `GET` | `/api/messages/:visitorId` | Get conversation |

### Protected Endpoints (require login)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/check` | Check auth status |
| `GET` | `/api/owner/conversations` | List all conversations |
| `GET` | `/api/owner/conversations/:id/messages` | Get messages |
| `POST` | `/api/owner/messages/send` | Reply to visitor |
| `POST` | `/api/owner/messages/upload` | Upload file |
| `GET` | `/api/calling/config` | Get calling options |
| `POST` | `/api/twilio/call` | Initiate Twilio call |

## Custom Icon for Page

Easy! Find this in your `index.html` (around line 780):

```html
<div class="avatar">👋</div>
```

**Replace with any of these options:**

---

## Option 1: Different Emoji
```html
<div class="avatar">💬</div>
```

Other good emojis:
- 📞 Phone
- 🎙️ Microphone  
- 💻 Computer
- 🚀 Rocket
- ⚡ Lightning
- 🔷 Diamond
- 👨‍💻 Tech person
- 🤖 Robot
- 🌐 Globe
- ✨ Sparkles

---

## Option 2: Your Initials
```html
<div class="avatar" style="font-size: 36px; font-weight: 700;">YOUR INTIALS</div>
```

---

## Option 3: Custom Image
```html
<div class="avatar" style="padding: 0; overflow: hidden;">
  <img src="/your-photo.jpg" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
</div>
```

---

## Option 4: SVG Icon
```html
<div class="avatar">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="50" height="50">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
</div>
```

---

## Option 5: Animated Icon (CSS)

**HTML:**
```html
<div class="avatar pulse-icon">📡</div>
```

**Add to CSS:**
```css
.pulse-icon {
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

---


## 🗺️ Roadmap

- [ ] Full SIP.js browser integration
- [ ] Twilio browser-based calling (two-way)
- [ ] Call recording
- [ ] Voicemail
- [ ] Multiple owner accounts (team)
- [ ] Canned responses / quick replies
- [ ] SMS messaging via Twilio
- [ ] WhatsApp Business integration
- [ ] Contact management / address book

## 📄 License

MIT - Use freely!

---

**Built with ❤️ using:**
- [WebRTC](https://webrtc.org/) - Voice/video
- [Socket.IO](https://socket.io/) - Real-time messaging
- [Express](https://expressjs.com/) - Web server
- [MySQL](https://mysql.com/) - Database
- [Twilio](https://twilio.com/) - PSTN calling
