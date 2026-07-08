"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediumProvider = void 0;
class MediumProvider {
    name = "medium";
    async search(query, options) {
        console.warn("Medium provider has no live search integration configured. Returning no results.");
        return [];
    }
}
exports.MediumProvider = MediumProvider;
//# sourceMappingURL=index.js.map