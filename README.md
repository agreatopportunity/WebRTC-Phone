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
