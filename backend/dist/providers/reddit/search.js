"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchReddit = searchReddit;
const index_1 = require("./index");
const provider = new index_1.RedditProvider();
async function searchReddit(query, options) {
    return provider.search(query, options);
}
//# sourceMappingURL=search.js.map