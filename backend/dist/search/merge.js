"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeResults = mergeResults;
function mergeResults(resultSets) {
    const seen = new Set();
    const merged = [];
    for (const results of resultSets) {
        for (const item of results) {
            if (!seen.has(item.url)) {
                seen.add(item.url);
                merged.push(item);
            }
        }
    }
    return merged;
}
//# sourceMappingURL=merge.js.map