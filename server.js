/**
 * WebRTC Phone Server - Self-Hosted Encrypted Calling System
 * 
 * This server handles:
 * - WebSocket signaling for WebRTC peer connections
 * - Push notification subscriptions
 * - Email notifications for incoming calls
 * - Room management for call routing
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import webpush from 'web-push';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// =============================================================================
// CONFIGURATION - Edit these values
// =============================================================================

const CONFIG = {
  port: process.env.PORT || 3000,
  
  // Your domain (used for VAPID and notifications)
  domain: process.env.DOMAIN || 'localhost:3000',
  
  // Owner's email for notifications
  ownerEmail: process.env.OWNER_EMAIL || 'your-email@example.com',
  
  // VAPID keys for push notifications (generate with: npx web-push generate-vapid-keys)
  vapid: {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    email: process.env.VAPID_EMAIL || 'mailto:your-email@example.com'
  },
  
  // Email configuration (optional - for email notifications)
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  
  // STUN/TURN servers for NAT traversal
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Add your own TURN server here for better connectivity:
    // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
  ]
};

// =============================================================================
// STORAGE
// =============================================================================

// Store push subscriptions
let pushSubscriptions = [];
const SUBSCRIPTIONS_FILE = join(__dirname, 'data', 'subscriptions.json');

// Ensure data directory exists
if (!fs.existsSync(join(__dirname, 'data'))) {
  fs.mkdirSync(join(__dirname, 'data'));
}

// Load existing subscriptions
if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
  try {
    pushSubscriptions = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8'));
  } catch (e) {
    console.error('Error loading subscriptions:', e);
  }
}

function saveSubscriptions() {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(pushSubscriptions, null, 2));
}

// Active calls/rooms
const rooms = new Map();
const ownerSockets = new Set();

// =============================================================================
// WEB PUSH SETUP
// =============================================================================

if (CONFIG.vapid.publicKey && CONFIG.vapid.privateKey) {
  webpush.setVapidDetails(
    CONFIG.vapid.email,
    CONFIG.vapid.publicKey,
    CONFIG.vapid.privateKey
  );
}

async function sendPushNotification(title, body, data = {}) {
  if (!CONFIG.vapid.publicKey) {
    console.log('Push notifications not configured');
    return;
  }
  
  const payload = JSON.stringify({
    title,
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data,
    requireInteraction: true,
    actions: [
      { action: 'answer', title: 'Answer' },
      { action: 'decline', title: 'Decline' }
    ]
  });
  
  const results = await Promise.allSettled(
    pushSubscriptions.map(sub => 
      webpush.sendNotification(sub, payload).catch(err => {
        if (err.statusCode === 410) {
          // Subscription expired, remove it
          pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== sub.endpoint);
          saveSubscriptions();
        }
        throw err;
      })
    )
  );
  
  console.log(`Push sent to ${results.filter(r => r.status === 'fulfilled').length}/${pushSubscriptions.length} subscribers`);
}

// =============================================================================
// EMAIL SETUP
// =============================================================================

let emailTransporter = null;

if (CONFIG.email.enabled && CONFIG.email.user && CONFIG.email.pass) {
  emailTransporter = nodemailer.createTransport({
    host: CONFIG.email.host,
    port: CONFIG.email.port,
    secure: CONFIG.email.secure,
    auth: {
      user: CONFIG.email.user,
      pass: CONFIG.email.pass
    }
  });
}

async function sendEmailNotification(callerName) {
  if (!emailTransporter) return;
  
  try {
    await emailTransporter.sendMail({
      from: CONFIG.email.user,
      to: CONFIG.ownerEmail,
      subject: `📞 Incoming Call from ${callerName}`,
      html: `
        <div style="font-family: system-ui; padding: 20px; background: #1a1a2e; color: #fff; border-radius: 12px;">
          <h2 style="color: #00d4ff;">📞 Incoming Call</h2>
          <p style="font-size: 18px;">You have an incoming call from <strong>${callerName}</strong></p>
          <a href="https://${CONFIG.domain}/owner" 
             style="display: inline-block; background: #00d4ff; color: #000; padding: 12px 24px; 
                    border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">
            Answer Call
          </a>
        </div>
      `
    });
    console.log('Email notification sent');
  } catch (err) {
    console.error('Email error:', err);
  }
}

// =============================================================================
// EXPRESS MIDDLEWARE
// =============================================================================

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// API Routes
app.get('/api/config', (req, res) => {
  res.json({
    vapidPublicKey: CONFIG.vapid.publicKey,
    iceServers: CONFIG.iceServers
  });
});

app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  
  // Check if already subscribed
  const exists = pushSubscriptions.some(s => s.endpoint === subscription.endpoint);
  if (!exists) {
    pushSubscriptions.push(subscription);
    saveSubscriptions();
    console.log('New push subscription added');
  }
  
  res.json({ success: true });
});

app.post('/api/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== endpoint);
  saveSubscriptions();
  res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeRooms: rooms.size,
    ownerOnline: ownerSockets.size > 0,
    pushSubscribers: pushSubscriptions.length
  });
});

// =============================================================================
// SOCKET.IO SIGNALING
// =============================================================================

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Owner registers their presence
  socket.on('register-owner', () => {
    ownerSockets.add(socket.id);
    socket.join('owner-room');
    console.log(`Owner registered: ${socket.id}`);
    socket.emit('registered', { role: 'owner' });
  });
  
  // Visitor initiates a call
  socket.on('initiate-call', async (data) => {
    const { callerName } = data;
    const roomId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create room
    rooms.set(roomId, {
      caller: socket.id,
      callerName,
      owner: null,
      status: 'ringing',
      createdAt: Date.now()
    });
    
    socket.join(roomId);
    socket.roomId = roomId;
    
    console.log(`Call initiated by ${callerName} in room ${roomId}`);
    
    // Notify owner via WebSocket
    io.to('owner-room').emit('incoming-call', {
      roomId,
      callerName,
      callerId: socket.id
    });
    
    // Send push notification
    await sendPushNotification(
      '📞 Incoming Call',
      `${callerName} is calling you`,
      { roomId, callerName, action: 'incoming-call' }
    );
    
    // Send email notification
    await sendEmailNotification(callerName);
    
    socket.emit('call-initiated', { roomId, status: 'ringing' });
  });
  
  // Owner answers the call
  socket.on('answer-call', (data) => {
    const { roomId } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Call no longer exists' });
      return;
    }
    
    room.owner = socket.id;
    room.status = 'connecting';
    socket.join(roomId);
    socket.roomId = roomId;
    
    console.log(`Owner answering call in room ${roomId}`);
    
    // Notify caller that owner is connecting
    io.to(room.caller).emit('call-answered', { roomId });
    
    // Owner will create the offer
    socket.emit('create-offer', { roomId, targetId: room.caller });
  });
  
  // Owner declines the call
  socket.on('decline-call', (data) => {
    const { roomId } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      io.to(room.caller).emit('call-declined', { roomId });
      rooms.delete(roomId);
    }
  });
  
  // Caller cancels the call
  socket.on('cancel-call', (data) => {
    const { roomId } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      io.to('owner-room').emit('call-cancelled', { roomId });
      rooms.delete(roomId);
    }
  });
  
  // WebRTC Signaling
  socket.on('offer', (data) => {
    const { roomId, offer, targetId } = data;
    console.log(`Offer from ${socket.id} to ${targetId}`);
    io.to(targetId).emit('offer', { offer, roomId, senderId: socket.id });
  });
  
  socket.on('answer', (data) => {
    const { roomId, answer, targetId } = data;
    console.log(`Answer from ${socket.id} to ${targetId}`);
    io.to(targetId).emit('answer', { answer, roomId, senderId: socket.id });
  });
  
  socket.on('ice-candidate', (data) => {
    const { roomId, candidate, targetId } = data;
    io.to(targetId).emit('ice-candidate', { candidate, roomId, senderId: socket.id });
  });
  
  // End call
  socket.on('end-call', (data) => {
    const { roomId } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      io.to(roomId).emit('call-ended', { roomId });
      rooms.delete(roomId);
    }
  });
  
  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Remove from owner sockets if applicable
    ownerSockets.delete(socket.id);
    
    // Handle active call cleanup
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        io.to(socket.roomId).emit('call-ended', { 
          roomId: socket.roomId, 
          reason: 'peer-disconnected' 
        });
        rooms.delete(socket.roomId);
      }
    }
  });
});

// =============================================================================
// CLEANUP - Remove stale rooms every 5 minutes
// =============================================================================

setInterval(() => {
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutes
  
  for (const [roomId, room] of rooms.entries()) {
    if (now - room.createdAt > maxAge) {
      io.to(roomId).emit('call-ended', { roomId, reason: 'timeout' });
      rooms.delete(roomId);
      console.log(`Cleaned up stale room: ${roomId}`);
    }
  }
}, 5 * 60 * 1000);

// =============================================================================
// START SERVER
// =============================================================================

server.listen(CONFIG.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                  WebRTC Phone Server                          ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running on port ${CONFIG.port.toString().padEnd(37)}║
║                                                               ║
║  Visitor page:  http://localhost:${CONFIG.port}/                      ║
║  Owner page:    http://localhost:${CONFIG.port}/owner                 ║
║                                                               ║
║  Push notifications: ${CONFIG.vapid.publicKey ? 'Configured ✓' : 'Not configured ✗'}                      ║
║  Email notifications: ${CONFIG.email.enabled ? 'Configured ✓' : 'Not configured ✗'}                     ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});
