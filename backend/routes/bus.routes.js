import express from 'express';
import { getLiveBuses, getStops, getSchedules, getAllBuses } from '../controllers/bus.controller.js';

const router = express.Router();

router.get('/live', getLiveBuses);
router.get('/stops', getStops);
router.get('/schedules', getSchedules);
router.get('/all', getAllBuses);

export default router;