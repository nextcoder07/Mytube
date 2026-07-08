"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteProvider = void 0;
class WebsiteProvider {
    name = "website";
    async search(query, options) {
        console.warn("Website provider has no live search integration configured. Returning no results.");
        return [];
    }
}
exports.WebsiteProvider = WebsiteProvider;
//# sourceMappingURL=index.js.map