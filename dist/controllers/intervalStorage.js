"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRaidInterval = setRaidInterval;
exports.clearRaidInterval = clearRaidInterval;
const intervalMap = {};
function setRaidInterval(messageId, interval) {
    intervalMap[messageId] = interval;
}
function clearRaidInterval(messageId) {
    const interval = intervalMap[messageId];
    if (interval) {
        clearInterval(interval);
        delete intervalMap[messageId];
    }
}
