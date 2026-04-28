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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const vetOnly_1 = require("../middleware/vetOnly");
const vetDashboardController = __importStar(require("../controllers/vet-dashboard.controller"));
const router = (0, express_1.Router)();
const wrap = (fn) => (req, res) => fn(req, res);
router.use(auth_1.authMiddleware, (req, res, next) => (0, vetOnly_1.vetOnly)(req, res, next));
router.get("/me", wrap(vetDashboardController.getMe));
router.get("/stats", wrap(vetDashboardController.getStats));
router.get("/appointments", wrap(vetDashboardController.getAppointments));
router.patch("/appointments/:id/confirm", wrap(vetDashboardController.confirmAppointment));
router.patch("/appointments/:id/decline", wrap(vetDashboardController.declineAppointment));
router.put("/availability", wrap(vetDashboardController.updateAvailability));
router.put("/profile", wrap(vetDashboardController.updateProfile));
exports.default = router;
