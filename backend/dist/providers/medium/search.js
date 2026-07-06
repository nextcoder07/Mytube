"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMedium = searchMedium;
const index_1 = require("./index");
const provider = new index_1.MediumProvider();
async function searchMedium(query, options) {
    return provider.search(query, options);
}
//# sourceMappingURL=search.js.map