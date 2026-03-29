import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes/v1';
import hpp from 'hpp';
import { globalLimiter } from './middlewares/rateLimiter.middleware';

const app = express();

// Security
app.use(helmet());
app.use(cors());
app.use(globalLimiter);
app.use(hpp());

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Sanitization (must be after body parsing)
// am using joi so dont it

// Utility
app.use(compression());
app.use(morgan('combined'));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/v1', routes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
