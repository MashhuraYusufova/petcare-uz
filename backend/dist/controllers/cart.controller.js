"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCart = getCart;
exports.addToCart = addToCart;
exports.updateQuantity = updateQuantity;
exports.removeFromCart = removeFromCart;
exports.clearCart = clearCart;
const cartService = __importStar(require("../services/cart.service"));
function getCart(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const items = yield cartService.getCart(req.user.userId);
            res.json(items);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
}
function addToCart(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { productId, quantity } = req.body;
        if (!productId) {
            res.status(400).json({ error: "productId is required" });
            return;
        }
        try {
            const item = yield cartService.addToCart(req.user.userId, productId, quantity);
            res.status(201).json(item);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
}
function updateQuantity(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { quantity } = req.body;
        const productId = String(req.params.productId);
        try {
            const item = yield cartService.updateCartItemQuantity(req.user.userId, productId, quantity);
            res.json(item);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
}
function removeFromCart(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const productId = String(req.params.productId);
        try {
            yield cartService.removeFromCart(req.user.userId, productId);
            res.json({ message: "Removed from cart" });
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    });
}
function clearCart(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield cartService.clearCart(req.user.userId);
            res.json({ message: "Cart cleared" });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
}
