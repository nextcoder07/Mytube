"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchGitHub = searchGitHub;
const index_1 = require("./index");
const provider = new index_1.GitHubProvider();
async function searchGitHub(query, options) {
    return provider.search(query, options);
}
//# sourceMappingURL=search.js.map