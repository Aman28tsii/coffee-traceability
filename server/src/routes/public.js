import express from 'express';
import { getPublicTrace } from '../controllers/publicController.js';

const router = express.Router();

router.get('/trace/:lotNumber', getPublicTrace);

export default router;