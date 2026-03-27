import { ObjectId } from "mongodb";
import {z} from "zod";

export interface Tracks {
    id?: ObjectId;
    fiaTrackName: string;
    trackLayout: string;
    circuitName: string;
    trackLocation: string;
    numDRSZones: string;
    trackLength: string;
    qualiFL: string;
    raceFL: string;
}

export const createTrackSchema = z.object({
    fiaTrackName: z.string().min(1, "Track Name is required"),
    trackLayout: z.string().min(1, "Track layout is required"),
    circuitName: z.string().min(1, "Circuit name is required"),
    trackLocation: z.string().min(1, "Location is required"),
    numDRSZones: z.string().min(1, "DRS zone count required"),
    trackLength: z.string().min(1, "Track length required"),
    qualiFL: z.string().min(1, "Quali FL required"),
    raceFL: z.string().min(1, "Race FL required"),
});