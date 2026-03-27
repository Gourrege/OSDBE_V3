import express, {Router} from 'express';
import {
  getTrack,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
} from '../controllers/tracks';
import { validate } from '../middleware/validate.middleware';
import { createTrackSchema } from '../models/tracks';

const router: Router = express.Router();

router.get('/tracks', getTrack);
router.get('/tracks/:id', getTrackById);
router.post('/tracks/', validate(createTrackSchema), createTrack);
router.put('/tracks/:id', updateTrack);
router.delete('/tracks/:id', deleteTrack);

export default router;