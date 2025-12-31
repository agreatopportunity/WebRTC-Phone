# 📞💬 WebRTC Phone + Messaging

A self-hosted, encrypted calling **AND** messaging system with authentication, MySQL persistence, and PWA support.

## ✨ What's New in the Updates 

- **💬 Messaging** - Real-time chat alongside voice calls
- **🔐 Authentication** - Password-protected owner dashboard  
- **🗄️ MySQL Storage** - Messages persist across sessions
- **📥 Inbox View** - Full conversation management
- **🔔 Unified Notifications** - Push/email for both calls AND messages

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Visitor                                      │
│                        │                                         │
│           ┌────────────┴────────────┐                           │
│           │                         │                           │
│      [📞 Call]               [💬 Message]                       │
│           │                         │                           │
│           ▼                         ▼                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Your Linux Server                       │    │
│  │                                                          │    │
│  │   Node.js + Socket.IO + Express                         │    │
│  │         │                                                │    │
│  │         ├── WebRTC Signaling (calls)                    │    │
│  │         ├── Real-time Messaging                         │    │
│  │         └── REST API (auth, messages)                   │    │
│  │                    │                                     │    │
│  │                    ▼                                     │    │
│  │              ┌──────────┐                               │    │
│  │              │  MySQL   │  Messages, Conversations,     │    │
│  │              │          │  Sessions, Owners             │    │
│  │              └──────────┘                               │    │
│  └──────────────────────────────────────────────────────────┘    │
│                        │                                         │
│           ┌────────────┴────────────┐                           │
│           │                         │                           │
│      [Push Notif]            [Email Alert]                      │
│           │                         │                           │
│           ▼                         ▼                           │
│       ┌──────────────────────────────────┐                      │
│       │     Owner Dashboard (PWA)         │                      │
│       │     - Login required              │                      │
│       │     - Inbox with conversations    │                      │
│       │     - Real-time chat              │                      │
│       │     - Answer calls                │                      │
│       └──────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- MySQL 8+ (or MariaDB)

### 2. Clone & Install

```bash
git clone <repo>
cd webrtc-phone-v2
npm install
```

### 3. Set Up MySQL

```bash
# Log into MySQL
mysql -u root -p

# Run the schema
source database/schema.sql

# Exit
exit
```

### 4. Configure

```bash
# Copy example config
cp .env.example .env

# Edit with your settings
nano .env
```

Key settings to configure:
- `MYSQL_PASSWORD` - Your MySQL password
- `SESSION_SECRET` - Random string (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `DOMAIN` - Your domain name

### 5. Create Owner Account

```bash
npm run create-owner
```

This will prompt you for username/password.

### 6. Start Server

```bash
npm start
```

### 7. Access

- Visitor page: `https://your-domain.com/`
- Login: `https://your-domain.com/login`
- Owner dashboard: `https://your-domain.com/owner`

## 📱 Features

### For Visitors
- Enter name, choose to **Call** or **Message**
- Real-time chat with message history
- WebRTC voice calls with visualizer
- Works on mobile as installable PWA

### For Owner
- **Login required** - secure access
- **Inbox** - see all conversations
- **Real-time messaging** - respond instantly
- **Call notifications** - answer from any device
- **Push notifications** - works even when browser closed

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `DOMAIN` | Your domain | Yes |
| `SESSION_SECRET` | Random secret for sessions | Yes |
| `MYSQL_HOST` | MySQL hostname | Yes |
| `MYSQL_USER` | MySQL username | Yes |
| `MYSQL_PASSWORD` | MySQL password | Yes |
| `MYSQL_DATABASE` | Database name | Yes |
| `OWNER_EMAIL` | Email for notifications | Yes |
| `VAPID_*` | Push notification keys | For push |
| `SMTP_*` | Email settings | For email |

### Generate VAPID Keys

```bash
npm run generate-vapid
```

Copy the keys to your `.env` file.

### Change Owner Password

```bash
npm run create-owner
# Enter same username with new password
```

## 🔐 Security

- **Password hashing** - bcrypt with salt rounds
- **Session management** - Secure cookies with MySQL store
- **WebRTC encryption** - DTLS-SRTP for voice
- **TLS** - Use HTTPS (required for WebRTC anyway)

## 📁 Project Structure

```
webrtc-phone-v2/
├── server.js                 # Main server
├── package.json
├── .env                      # Your configuration
├── database/
│   └── schema.sql            # MySQL schema
├── scripts/
│   └── create-owner.js       # Owner account management
└── public/
    ├── index.html            # Visitor page
    ├── login.html            # Owner login
    ├── owner.html            # Owner dashboard
    ├── sw.js                 # Service worker
    └── manifest*.json        # PWA manifests
```

## 🐛 Troubleshooting

### "Access denied for user"
- Check MySQL credentials in `.env`
- Make sure user has permissions on the database

### "Cannot connect to database"
- Is MySQL running? `sudo systemctl status mysql`
- Did you create the database? `mysql -e "CREATE DATABASE webrtc_phone"`

### Messages not persisting
- Check MySQL connection: `curl http://localhost:3000/api/health`
- Look for database errors in server logs

### Push notifications not working
- VAPID keys configured in `.env`?
- Using HTTPS? (required for push)
- Notifications enabled in browser?

## 📝 API Endpoints

### Public
- `GET /api/config` - Get ICE servers & VAPID key
- `POST /api/visitor/register` - Register/get visitor ID
- `POST /api/messages/send` - Send message (visitor)
- `GET /api/messages/:visitorId` - Get conversation (visitor)

### Protected (require login)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check auth status
- `GET /api/owner/conversations` - List all conversations
- `GET /api/owner/conversations/:id/messages` - Get messages
- `POST /api/owner/messages/send` - Reply to visitor

## 🚀 Deployment

### With Cloudflare Tunnel

```bash
# Start server
npm start

# In another terminal
cloudflared tunnel --url http://localhost:3000
```

### With systemd

Create `/etc/systemd/system/webrtc-phone.service`:

```ini
[Unit]
Description=WebRTC Phone + Messaging
After=network.target mysql.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/webrtc-phone-v2
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable webrtc-phone
sudo systemctl start webrtc-phone
```

## 📄 License

MIT - Use freely!
