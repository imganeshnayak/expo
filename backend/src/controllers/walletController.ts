import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Wallet from '../models/Wallet';
import { v4 as uuidv4 } from 'uuid';

// @desc    Get wallet balance and transactions
// @route   GET /api/wallet
// @access  Private
export const getWallet = async (req: Request, res: Response) => {
    try {
        let wallet = await Wallet.findOne({ userId: req.user?._id });

        if (!wallet) {
            // Create wallet if it doesn't exist
            wallet = await Wallet.create({
                userId: req.user?._id,
                balance: 0,
                transactions: [],
            });
        }

        res.status(200).json(wallet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Top up wallet
// @route   POST /api/wallet/topup
// @access  Private
export const topUpWallet = async (req: Request, res: Response) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Please provide a valid amount' });
        }

        let wallet = await Wallet.findOne({ userId: req.user?._id });

        if (!wallet) {
            wallet = await Wallet.create({
                userId: req.user?._id,
                balance: 0,
                transactions: [],
            });
        }

        const transaction = {
            transactionId: uuidv4(),
            type: 'WALLET_TOPUP',
            amount,
            description: 'Wallet top-up',
            status: 'completed',
            createdAt: new Date(),
        };

        wallet.balance += amount;
        wallet.transactions.unshift(transaction as any);

        await wallet.save();

        res.status(200).json(wallet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Withdraw from wallet
// @route   POST /api/wallet/withdraw
// @access  Private
export const withdrawWallet = async (req: Request, res: Response) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Please provide a valid amount' });
        }

        const wallet = await Wallet.findOne({ userId: req.user?._id });

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        if (wallet.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const transaction = {
            transactionId: uuidv4(),
            type: 'WITHDRAWAL',
            amount,
            description: 'Wallet withdrawal',
            status: 'completed',
            createdAt: new Date(),
        };

        wallet.balance -= amount;
        wallet.transactions.unshift(transaction as any);

        await wallet.save();

        res.status(200).json(wallet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
