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
exports.getMe = getMe;
exports.getAppointments = getAppointments;
exports.getStats = getStats;
exports.confirmAppointment = confirmAppointment;
exports.declineAppointment = declineAppointment;
exports.updateAvailability = updateAvailability;
exports.updateProfile = updateProfile;
const vetDashboardService = __importStar(require("../services/vet-dashboard.service"));
function getMe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.json(req.vet);
    });
}
function getAppointments(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield vetDashboardService.getVetAppointments(req.vet.id));
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
}
function getStats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield vetDashboardService.getVetStats(req.vet.id));
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
}
function confirmAppointment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield vetDashboardService.confirmAppointment(req.vet.id, String(req.params.id)));
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
}
function declineAppointment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield vetDashboardService.declineAppointment(req.vet.id, String(req.params.id)));
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
}
function updateAvailability(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { slots } = req.body;
        if (!Array.isArray(slots)) {
            res.status(400).json({ error: "slots must be an array" });
            return;
        }
        try {
            res.json(yield vetDashboardService.updateAvailability(req.vet.id, slots));
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
}
function updateProfile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json(yield vetDashboardService.updateVetProfile(req.vet.id, req.body));
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
}
