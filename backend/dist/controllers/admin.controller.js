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
exports.getOverview = getOverview;
exports.getUsers = getUsers;
exports.getAppointments = getAppointments;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.createVet = createVet;
exports.updateVet = updateVet;
exports.deleteVet = deleteVet;
exports.updateUserRole = updateUserRole;
const adminService = __importStar(require("../services/admin.service"));
function getOverview(_req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield adminService.getOverviewStats());
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
}
function getUsers(_req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield adminService.getAllUsers());
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
}
function getAppointments(_req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield adminService.getAllAppointments());
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
}
function createProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, price, oldPrice, rating, reviews, tag, img, brand, cat, stock } = req.body;
        if (!name || price == null || !img || !brand || !cat) {
            res.status(400).json({ error: "name, price, img, brand, cat are required" });
            return;
        }
        try {
            res.status(201).json(yield adminService.createProduct({ name, price, oldPrice, rating: rating !== null && rating !== void 0 ? rating : 0, reviews: reviews !== null && reviews !== void 0 ? reviews : 0, tag, img, brand, cat, stock }));
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
}
function updateProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield adminService.updateProduct(String(req.params.id), req.body));
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    });
}
function deleteProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield adminService.deleteProduct(String(req.params.id));
            res.json({ message: "Product deleted" });
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    });
}
function createVet(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, spec, clinic, district, rating, reviews, exp, price, avail, slots, email } = req.body;
        if (!name || !spec || !clinic || !district || !exp || !price) {
            res.status(400).json({ error: "name, spec, clinic, district, exp, price are required" });
            return;
        }
        try {
            res.status(201).json(yield adminService.createVet({ name, spec, clinic, district, rating: rating !== null && rating !== void 0 ? rating : 5.0, reviews: reviews !== null && reviews !== void 0 ? reviews : 0, exp, price, avail: avail !== null && avail !== void 0 ? avail : true, slots: slots !== null && slots !== void 0 ? slots : [], email }));
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
}
function updateVet(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield adminService.updateVet(String(req.params.id), req.body));
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    });
}
function deleteVet(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield adminService.deleteVet(String(req.params.id));
            res.json({ message: "Vet deleted" });
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    });
}
function updateUserRole(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { role } = req.body;
        if (!role) {
            res.status(400).json({ error: "role is required" });
            return;
        }
        try {
            res.json(yield adminService.updateUserRole(String(req.params.id), role));
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    });
}
