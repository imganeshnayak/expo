import { Request, Response } from 'express';
import { SpawnService } from '../services/game/SpawnService';
import UtopianArchetype from '../models/game/UtopianArchetype';
import UserCollection from '../models/game/UserCollection';
import User from '../models/User';
import mongoose from 'mongoose';

// extend Request to include user (from auth middleware)
interface AuthRequest extends Request {
    user?: any;
}

export const getSpawns = async (req: AuthRequest, res: Response) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const lat = parseFloat(latitude as string);
        const lng = parseFloat(longitude as string);

        const spawns = await SpawnService.getSpawnsAround(lat, lng);

        // Filter out spawns already caught by user recently? 
        // For MVP, we'll rely on client-side tracking or assume random seed changes enough.
        // Or we could check if user already has this specific instance ID captured?
        // Since instance ID is deterministic hash, this is possible.

        res.status(200).json({
            success: true,
            count: spawns.length,
            data: spawns
        });
    } catch (error) {
        console.error('Error fetching spawns:', error);
        res.status(500).json({ message: 'Server error fetching spawns' });
    }
};

export const catchUtopian = async (req: AuthRequest, res: Response) => {
    try {
        const { instanceId, archetypeId, location } = req.body;
        const userId = req.user._id;

        // Basic validation
        // In a real game, we'd verify the user is actually close to the spawn location
        // and that the spawn is valid for the current time window.
        // For MVP, we'll trust the client handshake for now.

        const archetype = await UtopianArchetype.findById(archetypeId);
        if (!archetype) {
            return res.status(404).json({ message: 'Utopian Archetype not found' });
        }

        // Check if already caught (optional uniqueness constraint per user per instance?)
        // Let's allow catching multiple of same archetype, but maybe unique per "instance" if we tracked spawned IDs.
        // For simple collection, just create new entry.

        // Calculate Random IVs (0-100)
        const iv = {
            power: Math.floor(Math.random() * 101),
            charm: Math.floor(Math.random() * 101),
            chaos: Math.floor(Math.random() * 101)
        };

        // Calculate Stats
        // Base * (1 + (IV / 200)) -> Max 50% bonus at 100 IV? Or simpler: Base + IV/2
        // Let's do: Stat = Base + (IV / 10)
        const stats = {
            power: Math.round(archetype.baseStats.power + (iv.power / 5)),
            charm: Math.round(archetype.baseStats.charm + (iv.charm / 5)),
            chaos: Math.round(archetype.baseStats.chaos + (iv.chaos / 5))
        };

        // Shiny roll (1%)
        const isShiny = Math.random() < 0.01;

        const newCatch = await UserCollection.create({
            userId,
            archetypeId,
            level: 1,
            xp: 0,
            iv,
            stats,
            isShiny,
            locationCaught: location,
            capturedAt: new Date()
        });

        // Populate details for return
        await newCatch.populate('archetypeId');

        // Award User XP (Global Rank)
        // GamificationService.addXP(userId, 20); // TODO: Integrate with GamificationService

        res.status(201).json({
            success: true,
            data: newCatch,
            message: `You caught ${archetype.name}!`
        });

    } catch (error) {
        console.error('Error catching utopian:', error);
        res.status(500).json({ message: 'Server error catching utopian' });
    }
};

export const getMyCollection = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        const collection = await UserCollection.find({ userId })
            .populate('archetypeId')
            .sort({ capturedAt: -1 });

        res.status(200).json({
            success: true,
            count: collection.length,
            data: collection
        });
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ message: 'Server error fetching collection' });
    }
};
