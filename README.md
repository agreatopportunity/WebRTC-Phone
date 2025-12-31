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

- **HTTPS** - Required for WebRTC and Push Notifications
- Node.js 18+
- MySQL 8+ (or MariaDB)

### 2. Clone & Install

```bash
git clone https://github.com/agreatopportunity/WebRTC-Phone.git
cd WebRTC-Phone
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


### Generate PWA Icons

Convert the SVG icon to PNG (or use your own icons):

```bash
# Using ImageMagick
convert -background none public/icon.svg -resize 192x192 public/icon-192.png
convert -background none public/icon.svg -resize 512x512 public/icon-512.png

# Or use an online tool like https://svgtopng.com/
```
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

# In another terminal, create a Cloudflare tunnel
cloudflared tunnel --url http://localhost:3000
```

Or configure a persistent tunnel in your Cloudflare dashboard pointing to `localhost:3000`.

### Option B: Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name phone.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option C: Direct with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d phone.yourdomain.com

# Update server.js to use HTTPS (see https-server.js example)
```

## 📱 Installing the PWA

### On Your Phone (Owner)

1. Open `https://your-domain.com/owner` in Chrome/Safari
2. Tap "Add to Home Screen" (or the install icon in the address bar)
3. Grant notification permissions when prompted
4. The app icon will appear on your home screen

### For Visitors

1. Share your URL: `https://your-domain.com`
2. They can call directly from their browser
3. Optionally, they can install it as a PWA too


### Gmail App Password

If using Gmail for email notifications:
1. Go to https://myaccount.google.com/apppasswords
2. Generate a new app password
3. Use that password in `SMTP_PASS`

## 🔊 TURN Server (Optional)

For better connectivity through restrictive NATs/firewalls, set up a TURN server:

### Using coturn

```bash
# Install
sudo apt install coturn

# Configure /etc/turnserver.conf
listening-port=3478
tls-listening-port=5349
fingerprint
lt-cred-mech
user=username:password
realm=your-domain.com
cert=/path/to/cert.pem
pkey=/path/to/key.pem

# Start
sudo systemctl enable coturn
sudo systemctl start coturn
```

Then add to your server config:

```javascript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { 
    urls: 'turn:your-domain.com:3478',
    username: 'username',
    credential: 'password'
  }
]
```
   
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
