"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'secret';
    return jsonwebtoken_1.default.sign({ id: id.toString() }, secret, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};
exports.default = generateToken;
