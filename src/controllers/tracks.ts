import { Request, Response } from 'express';
import { collections } from '../trackdatabase';
import { createTrackSchema, Tracks } from '../models/tracks'; // adjust if you rename the model file to 'track.ts'
import { ObjectId } from 'mongodb';

/**
 * GET /api/tracks
 * Retrieve all tracks (optionally filtered by query).
 */
export const getTrack = async (req: Request, res: Response) => {
  const rawFilter = req.query.filter;
  let filterObj = {};

  if (typeof rawFilter === 'string') {
    try {
      filterObj = JSON.parse(rawFilter);
    } catch (err) {
      console.error("Invalid filter JSON:", err);
      return res.status(400).json({ error: "Invalid filter format" });
    }
  }

  try {
    const tracks = await collections.tracks?.find(filterObj).toArray();
    res.status(200).json(tracks);
  } catch (error) {
    console.error(`Error fetching tracks:`, error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
};

/**
 * GET /api/tracks/:id
 * Retrieve a specific track by its MongoDB ObjectId.
 */
export const getTrackById = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid track ID format' });
    }

    const query = { _id: new ObjectId(id) };
    const track = await collections.tracks?.findOne(query);

    if (!track) {
      return res.status(404).json({ message: `Track with id ${id} not found` });
    }

    res.status(200).json(track);
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({ message: 'Failed to fetch track' });
  }
};

/**
 * POST /api/tracks
 * Create a new track in the database.
 */
export const createTrack = async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod
    const validation = createTrackSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.error.issues,
      });
    }

    const {
      fiaTrackName,
      trackLayout,
      circuitName,
      trackLocation,
      numDRSZones,
      trackLength,
      qualiFL,
      raceFL,
    } = req.body;

    const newTrack: Tracks = {
      fiaTrackName,
      trackLayout,
      circuitName,
      trackLocation,
      numDRSZones,
      trackLength,
      qualiFL,
      raceFL,
    };

    const result = await collections.tracks?.insertOne(newTrack);

    if (result) {
      res.status(201)
        .location(`${result.insertedId}`)
        .json({ message: `Created a new track with id ${result.insertedId}` });
    } else {
      res.status(500).json({ message: 'Failed to create track' });
    }
  } catch (error) {
    console.error('Error creating track:', error);
    res.status(500).json({ message: 'Unable to create new track' });
  }
};

/**
 * PUT /api/tracks/:id
 * Update an existing track.
 */
export const updateTrack = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid track ID format' });
    }

    const result = await collections.tracks?.updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );

    if (!result) {
      return res.status(500).json({ message: 'Update operation failed' });
    }

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: `Track with id ${id} not found` });
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({
        message: `No changes made for track ${id}`,
      });
    }

    res.status(200).json({ message: `Track ${id} updated successfully` });
  } catch (error) {
    console.error('Error updating track:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

/**
 * DELETE /api/tracks/:id
 * Delete a track from the database.
 */
export const deleteTrack = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid track ID format' });
    }

    const result = await collections.tracks?.deleteOne({ _id: new ObjectId(id) });

    if (result && result.deletedCount === 1) {
      res.status(200).json({ message: `Track ${id} deleted successfully` });
    } else {
      res.status(404).json({ message: `Track ${id} not found` });
    }
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ message: 'Failed to delete track' });
  }
};
