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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRaid = createRaid;
exports.updateRaidMetrics = updateRaidMetrics;
exports.fetchRaidByMessageId = fetchRaidByMessageId;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("../config");
const supabase = (0, supabase_js_1.createClient)(config_1.SUPABASE_URL, config_1.SUPABASE_KEY);
function createRaid(raid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase
                .from("raids")
                .insert([Object.assign(Object.assign({}, raid), { raid_completed: false })])
                .select();
            if (error) {
                console.error("Error inserting raid:", error.message);
                throw new Error("Error inserting raid");
            }
            return data;
        }
        catch (err) {
            console.error("Error creating raid:", err);
            throw err;
        }
    });
}
function updateRaidMetrics(raidId_1, metrics_1) {
    return __awaiter(this, arguments, void 0, function* (raidId, metrics, raidCompleted = false) {
        try {
            yield supabase
                .from("raids")
                .update({
                likes: metrics.likes,
                comments: metrics.comments,
                retweets: metrics.retweets,
                last_updated: new Date().toISOString(),
                raid_completed: raidCompleted,
            })
                .eq("id", raidId);
        }
        catch (error) {
            console.error("Error updating raid metrics:", error);
        }
    });
}
function fetchRaidByMessageId(messageId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase
                .from("raids")
                .select("*")
                .eq("message_id", messageId)
                .single();
            if (error) {
                console.error("Error fetching raid by message ID:", error.message);
                return null;
            }
            return data;
        }
        catch (err) {
            console.error("Error in fetchRaidByMessageId:", err);
            return null;
        }
    });
}
