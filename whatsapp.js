import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const { Client, LocalAuth } = pkg;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('📲 Scan this QR code:');
  qrcode.generate(qr, { small: true });
  console.log(qr);
});

client.on('authenticated', () => {
  console.log('🔐 WhatsApp authenticated');
});

client.on('auth_failure', msg => {
  console.error('❌ Authentication failed:', msg);
});

client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
});

client.on('disconnected', reason => {
  console.warn('⚠️ WhatsApp client disconnected:', reason);
});

client.on('message', async (message) => {
  console.log(`📩 Message from ${message.from}: ${message.body}`);
});

client.initialize();

export async function sendVerificationMessage(phoneNumber, code) {
  const chatId = phoneNumber.replace('+', '') + '@c.us';
  const message = `Your Robux Bird verification code is: *${code}*`;
  await client.sendMessage(chatId, message);
}
