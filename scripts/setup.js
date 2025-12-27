#!/usr/bin/env node

/**
 * Setup script for WebRTC Phone
 * Generates VAPID keys and creates .env configuration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║            WebRTC Phone Setup Wizard                          ║
╚═══════════════════════════════════════════════════════════════╝
  `);
  
  const config = {
    PORT: '3000',
    DOMAIN: '',
    OWNER_EMAIL: '',
    VAPID_PUBLIC_KEY: '',
    VAPID_PRIVATE_KEY: '',
    VAPID_EMAIL: '',
    EMAIL_ENABLED: 'false',
    SMTP_HOST: '',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: '',
    SMTP_PASS: ''
  };
  
  // Basic setup
  console.log('📡 Basic Configuration\n');
  
  config.PORT = await question('Port to run server on [3000]: ') || '3000';
  config.DOMAIN = await question('Your domain (e.g., phone.yourdomain.com): ');
  config.OWNER_EMAIL = await question('Your email (for notifications): ');
  
  // VAPID keys for push notifications
  console.log('\n🔔 Push Notification Setup\n');
  
  const setupPush = await question('Enable push notifications? (y/n) [y]: ');
  
  if (setupPush.toLowerCase() !== 'n') {
    console.log('\nGenerating VAPID keys...');
    
    try {
      const output = execSync('npx web-push generate-vapid-keys --json', { 
        encoding: 'utf8',
        cwd: join(__dirname, '..')
      });
      
      const keys = JSON.parse(output);
      config.VAPID_PUBLIC_KEY = keys.publicKey;
      config.VAPID_PRIVATE_KEY = keys.privateKey;
      config.VAPID_EMAIL = `mailto:${config.OWNER_EMAIL}`;
      
      console.log('✓ VAPID keys generated successfully');
    } catch (err) {
      console.log('⚠ Could not generate VAPID keys automatically.');
      console.log('  Run: npx web-push generate-vapid-keys');
      console.log('  Then add the keys to your .env file manually.');
    }
  }
  
  // Email notifications
  console.log('\n📧 Email Notification Setup\n');
  
  const setupEmail = await question('Enable email notifications? (y/n) [n]: ');
  
  if (setupEmail.toLowerCase() === 'y') {
    config.EMAIL_ENABLED = 'true';
    config.SMTP_HOST = await question('SMTP host [smtp.gmail.com]: ') || 'smtp.gmail.com';
    config.SMTP_PORT = await question('SMTP port [587]: ') || '587';
    config.SMTP_USER = await question('SMTP username (email): ');
    config.SMTP_PASS = await question('SMTP password (app password for Gmail): ');
    
    const secure = await question('Use SSL/TLS? (y/n) [n]: ');
    config.SMTP_SECURE = secure.toLowerCase() === 'y' ? 'true' : 'false';
  }
  
  // Generate .env file
  console.log('\n📝 Generating .env file...\n');
  
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envPath = join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('✓ Configuration saved to .env\n');
  
  // Summary
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    Setup Complete!                            ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  To start the server:                                         ║
║    npm start                                                  ║
║                                                               ║
║  URLs:                                                        ║
║    Visitor page: https://${config.DOMAIN || 'your-domain.com'}/                    
║    Owner page:   https://${config.DOMAIN || 'your-domain.com'}/owner               
║                                                               ║
║  Next steps:                                                  ║
║    1. Set up HTTPS (required for WebRTC)                      ║
║    2. Configure your reverse proxy (nginx/Cloudflare)         ║
║    3. Install the PWA on your phone                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
  
  rl.close();
}

main().catch(console.error);
