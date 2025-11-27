import { Request, Response } from 'express';
import ondcService from '../services/ondcService';

// @desc    Trigger ONDC Search (Client calls this)
// @route   POST /api/ondc/retail/search
// @access  Private
export const searchRetail = async (req: Request, res: Response) => {
    try {
        const { query, location } = req.body;

        // Construct intent for Retail (Magicpin)
        const intent = {
            item: {
                descriptor: {
                    name: query // e.g., "Pizza"
                }
            },
            fulfillment: {
                type: "Delivery",
                end: {
                    location: {
                        gps: location // "12.9716,77.5946"
                    }
                }
            }
        };

        const response = await ondcService.search('ONDC:RET11', intent); // RET11 is F&B
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'ONDC Search failed' });
    }
};

// @desc    Handle on_search callback (Magicpin calls this)
// @route   POST /api/ondc/retail/on_search
// @access  Public (Protected by signature verification in real world)
export const onSearchRetail = async (req: Request, res: Response) => {
    try {
        const { context, message } = req.body;

        console.log(`[ONDC] Received on_search from ${context.bpp_id}`);

        // In a real app, we would:
        // 1. Verify signature
        // 2. Parse catalog (message.catalog)
        // 3. Push data to frontend via Socket.IO or save to DB

        // For demo, we'll just log the catalog items
        if (message.catalog) {
            const providers = message.catalog['bpp/providers'];
            if (providers) {
                providers.forEach((p: any) => {
                    console.log(`Found Provider: ${p.descriptor.name}`);
                    p.items.forEach((i: any) => {
                        console.log(` - Item: ${i.descriptor.name} | Price: ${i.price.value}`);
                    });
                });
            }
        }

        // Acknowledge receipt
        res.status(200).json({ message: { ack: { status: 'ACK' } } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing on_search' });
    }
};
