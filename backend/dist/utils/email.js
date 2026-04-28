"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeEmail = normalizeEmail;
exports.emailsMatch = emailsMatch;
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function emailsMatch(left, right) {
    if (!left || !right)
        return false;
    return normalizeEmail(left) === normalizeEmail(right);
}
