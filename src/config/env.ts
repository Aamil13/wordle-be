import dotenv from 'dotenv';
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  mongoUri: process.env.MONGODB_URI || '',

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  email: {
    brevoApiKey: process.env.BREVO_API_KEY || '',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || '',
    fromName: process.env.EMAIL_FROM_NAME || 'Wordle App',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:8081',

  dailyResetKey: process.env.DAILY_RESET_KEY || '',
};
