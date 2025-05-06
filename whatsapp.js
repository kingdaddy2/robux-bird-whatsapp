import express from 'express';
import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const { Client, LocalAuth } = pkg;
const app = express();
app.use(express.json());

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
  console.log(qr); // Raw string QR for external generator use
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

// 🧠 Message sender function
export async function sendVerificationMessage(phoneNumber, code) {
  const chatId = phoneNumber.replace('+', '') + '@c.us';
  const message = `Your Wingy Coin verification code is: *${code}*`;
  await client.sendMessage(chatId, message);
}

// 🌐 Express endpoint to trigger from Glitch
app.post('/send-whatsapp', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ success: false, error: 'Missing phone or code' });
  }

  try {
    await sendVerificationMessage(phone, code);
    res.json({ success: true });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp API server running on port ${PORT}`);
});
