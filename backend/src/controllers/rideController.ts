import { Request, Response } from 'express';
import Ride from '../models/Ride';
import ondcService from '../services/ondcService';
import { v4 as uuidv4 } from 'uuid';

// @desc    Search for rides (ONDC)
// @route   POST /api/rides/search
// @access  Private
export const searchRides = async (req: Request, res: Response) => {
    try {
        const { pickup, destination } = req.body;

        // Construct intent for Mobility (TRV10)
        const intent = {
            fulfillment: {
                start: {
                    location: {
                        gps: pickup // "12.9716,77.5946"
                    }
                },
                end: {
                    location: {
                        gps: destination // "12.9279,77.6271"
                    }
                }
            }
        };

        // Call ONDC Service
        const response = await ondcService.search('ONDC:TRV10', intent);

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ride search failed' });
    }
};

// @desc    Book a ride (Mock implementation for now)
// @route   POST /api/rides/book
// @access  Private
export const bookRide = async (req: Request, res: Response) => {
    try {
        const { providerId, pickup, destination, price } = req.body;

        const ride = await Ride.create({
            userId: req.user?._id,
            provider: {
                id: providerId || 'namma-yatri',
                name: 'Namma Yatri',
                type: 'auto'
            },
            pickup: {
                address: 'Pickup Location',
                coordinates: { latitude: 0, longitude: 0 } // Mock
            },
            destination: {
                address: 'Drop Location',
                coordinates: { latitude: 0, longitude: 0 } // Mock
            },
            pricing: {
                basePrice: price || 100,
                finalPrice: price || 100,
                currency: 'INR'
            },
            status: 'confirmed',
            otp: '1234',
            ondcData: {
                transactionId: uuidv4(),
                messageId: uuidv4(),
                bppId: 'namma-yatri-bpp',
                bppUri: 'https://mock-bpp.com'
            }
        });

        res.status(201).json(ride);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Booking failed' });
    }
};

// @desc    Get active ride
// @route   GET /api/rides/active
// @access  Private
export const getActiveRide = async (req: Request, res: Response) => {
    try {
        const ride = await Ride.findOne({
            userId: req.user?._id,
            status: { $in: ['searching', 'confirmed', 'arriving', 'ongoing'] }
        }).sort({ createdAt: -1 });

        if (!ride) {
            return res.status(404).json({ message: 'No active ride' });
        }

        res.status(200).json(ride);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
