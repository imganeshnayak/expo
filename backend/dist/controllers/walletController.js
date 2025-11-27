"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawWallet = exports.topUpWallet = exports.getWallet = void 0;
const Wallet_1 = __importDefault(require("../models/Wallet"));
const uuid_1 = require("uuid");
// @desc    Get wallet balance and transactions
// @route   GET /api/wallet
// @access  Private
const getWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let wallet = yield Wallet_1.default.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!wallet) {
            // Create wallet if it doesn't exist
            wallet = yield Wallet_1.default.create({
                userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
                balance: 0,
                transactions: [],
            });
        }
        res.status(200).json(wallet);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getWallet = getWallet;
// @desc    Top up wallet
// @route   POST /api/wallet/topup
// @access  Private
const topUpWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Please provide a valid amount' });
        }
        let wallet = yield Wallet_1.default.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!wallet) {
            wallet = yield Wallet_1.default.create({
                userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
                balance: 0,
                transactions: [],
            });
        }
        const transaction = {
            transactionId: (0, uuid_1.v4)(),
            type: 'WALLET_TOPUP',
            amount,
            description: 'Wallet top-up',
            status: 'completed',
            createdAt: new Date(),
        };
        wallet.balance += amount;
        wallet.transactions.unshift(transaction);
        yield wallet.save();
        res.status(200).json(wallet);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.topUpWallet = topUpWallet;
// @desc    Withdraw from wallet
// @route   POST /api/wallet/withdraw
// @access  Private
const withdrawWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Please provide a valid amount' });
        }
        const wallet = yield Wallet_1.default.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        if (wallet.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }
        const transaction = {
            transactionId: (0, uuid_1.v4)(),
            type: 'WITHDRAWAL',
            amount,
            description: 'Wallet withdrawal',
            status: 'completed',
            createdAt: new Date(),
        };
        wallet.balance -= amount;
        wallet.transactions.unshift(transaction);
        yield wallet.save();
        res.status(200).json(wallet);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.withdrawWallet = withdrawWallet;
