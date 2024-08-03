import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';

dotenv.config();

const __dirname = path.resolve();
const app = express();

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, '/client/dist')));

// API routes
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

// Serve the front-end application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// MongoDB connection
const mongoUri = process.env.MONGO;
if (!mongoUri) {
  console.error('MongoDB connection string is not defined in environment variables.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB!');
    // Start the server after successful DB connection
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}!`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
