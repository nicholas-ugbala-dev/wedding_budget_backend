import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApiError } from './utils/error';
import v1Router from './routes/v1'


dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}))

app.use(express.json());

app.get('/health', async (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1', v1Router);

// error middleware
app.use(ApiError.appError);
app.use(ApiError.genericError)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


export default app;