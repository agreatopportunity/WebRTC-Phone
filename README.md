# 📞 WebRTC Phone - Self-Hosted Encrypted Calling

A completely free, self-hosted WebRTC calling system with PWA support. Anyone can call you from their browser, and you'll receive push notifications on your phone.

## ✨ Features

- **100% Free** - No SIP trunks, no monthly fees, no third-party services required
- **End-to-End Encrypted** - WebRTC provides DTLS-SRTP encryption
- **PWA Support** - Install on your phone's home screen like a native app
- **Push Notifications** - Get notified even when the browser is closed
- **Email Notifications** - Optional email alerts for incoming calls
- **Call History** - Track recent calls locally
- **Audio Visualizer** - Real-time audio feedback
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🏗️ Architecture

```
                              ┌─────────────────────┐
                              │   Your Linux Server │
                              │                     │
   Visitor                    │  ┌───────────────┐  │
   ┌──────┐    WebSocket      │  │   Node.js     │  │
   │ PWA  │◄──────────────────┼──┤   Signaling   │  │
   └──────┘                   │  │   Server      │  │
       │                      │  └───────────────┘  │
       │                      │         │           │
       │    WebRTC (P2P)      │         │ Push      │
       │◄─────────────────────┼─────────┼───────────┼────►  You (Owner)
       │    Audio Stream      │         │           │       ┌──────┐
       │                      │         ▼           │       │ PWA  │
       │                      │  ┌───────────────┐  │       └──────┘
       │                      │  │  Web Push /   │  │
       │                      │  │  Email        │──┼──────►  📱 Notification
       │                      │  └───────────────┘  │
       │                      └─────────────────────┘
       │                                │
       │        ICE Candidates          │
       └────────────────────────────────┘
                    via STUN
            (Google's free servers)
```

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/webrtc-phone.git
cd webrtc-phone
npm install
```

### 2. Run Setup Wizard

```bash
npm run setup
```

This will:
- Generate VAPID keys for push notifications
- Configure email notifications (optional)
- Create your `.env` file

### 3. Generate PWA Icons

Convert the SVG icon to PNG (or use your own icons):

```bash
# Using ImageMagick
convert -background none public/icon.svg -resize 192x192 public/icon-192.png
convert -background none public/icon.svg -resize 512x512 public/icon-512.png

# Or use an online tool like https://svgtopng.com/
```

### 4. Start the Server

```bash
npm start
```

Your server is now running on `http://localhost:3000`

## 🔐 Production Deployment

### Requirements

- **HTTPS** - Required for WebRTC and Push Notifications
- **Node.js 18+**
- **A domain name**

### Option A: Cloudflare Tunnel (Recommended for you)

Since you already use Cloudflare tunnels, this is the easiest option:

```bash
# Start the Node.js server
npm start

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

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `DOMAIN` | Your domain name | Yes |
| `OWNER_EMAIL` | Email for notifications | Yes |
| `VAPID_PUBLIC_KEY` | Push notification public key | For push |
| `VAPID_PRIVATE_KEY` | Push notification private key | For push |
| `VAPID_EMAIL` | mailto: URL for VAPID | For push |
| `EMAIL_ENABLED` | Enable email notifications | No |
| `SMTP_HOST` | SMTP server host | For email |
| `SMTP_PORT` | SMTP server port | For email |
| `SMTP_USER` | SMTP username | For email |
| `SMTP_PASS` | SMTP password | For email |

### Generate VAPID Keys Manually

```bash
npx web-push generate-vapid-keys
```

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

## 🛠️ Systemd Service

Create `/etc/systemd/system/webrtc-phone.service`:

```ini
[Unit]
Description=WebRTC Phone Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/webrtc-phone
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=webrtc-phone
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable webrtc-phone
sudo systemctl start webrtc-phone
sudo systemctl status webrtc-phone
```

## 📁 Project Structure

```
webrtc-phone/
├── server.js              # Main signaling server
├── package.json           # Dependencies
├── .env                   # Configuration (create from .env.example)
├── .env.example           # Example configuration
├── scripts/
│   └── setup.js           # Interactive setup wizard
├── data/
│   └── subscriptions.json # Push notification subscriptions (auto-created)
└── public/
    ├── index.html         # Visitor/caller page
    ├── owner.html         # Owner/receiver page
    ├── sw.js              # Service worker for PWA
    ├── manifest.json      # PWA manifest for visitors
    ├── manifest-owner.json # PWA manifest for owner
    ├── icon.svg           # App icon (SVG)
    ├── icon-192.png       # App icon (192x192)
    └── icon-512.png       # App icon (512x512)
```

## 🔒 Security Considerations

1. **HTTPS Required** - WebRTC and Push Notifications require HTTPS
2. **No Authentication** - Anyone with the URL can call. Consider adding basic auth if needed
3. **P2P Audio** - Audio goes directly between peers, not through your server
4. **Signaling Only** - Your server only handles connection setup
5. **Local Storage** - Call history stored in browser localStorage

## 🐛 Troubleshooting

### "Could not access microphone"
- Ensure HTTPS is configured
- Check browser permissions
- Try a different browser

### Push notifications not working
- Verify VAPID keys are set correctly
- Check browser supports Push API
- Ensure service worker is registered

### Calls don't connect
- Check if both peers have internet access
- Try adding a TURN server for NAT traversal
- Check browser console for WebRTC errors

### No audio
- Verify microphone is working
- Check if audio is muted
- Ensure `remoteAudio.srcObject` is set

## 📝 License

MIT License - Use freely!

## 🤝 Contributing

Pull requests welcome! Areas for improvement:
- Video calling support
- Multiple simultaneous calls
- Call recording (with consent)
- Contact list
- Text messaging
