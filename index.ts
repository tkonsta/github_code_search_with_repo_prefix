import { Octokit } from "octokit";
import "dotenv/config";
import { exit } from "process";

const ORG_NAME = process.env.ORG_NAME;
const REPO_PREFIX = process.env.REPO_PREFIX;
const CODE_SEARCH_KEYWORD = process.env.CODE_SEARCH_KEYWORD;

if (!ORG_NAME || !REPO_PREFIX || !CODE_SEARCH_KEYWORD) {
    console.log("Missing parameters. Please set them in .env file!");
    exit(1);
}

interface CodeSearchResult {
    repositoryName: string;
    itemPath: string;
    itemHtmlUrl: string;
}

console.log(
    `\n------------------\nSearching for ${CODE_SEARCH_KEYWORD} in organization ${ORG_NAME} and repo-prefix ${REPO_PREFIX}\n------------------\n`
);

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    throttle: {
        onRateLimit: (
            retryAfter: any,
            options: { method: any; url: any; request: any },
            octokit: { log: { warn: (arg0: string) => void } },
            retryCount: number
        ) => {
            octokit.log.warn(
                `Request quota exhausted for request ${options.method} ${options.url}. Retry after: ${retryAfter}, retryCount: ${retryCount}`
            );

            if (retryCount < 1) {
                // only retries once
                octokit.log.warn(`Retrying after ${retryAfter} seconds!`);
                return true;
            }
            return true;
        },
        onSecondaryRateLimit: (
            _: any,
            options: { method: any; url: any },
            octokit: { log: { warn: (arg0: string) => void } }
        ) => {
            // does not retry, only logs a warning
            octokit.log.warn(`SecondaryRateLimit detected for request ${options.method} ${options.url}`);
        },
    },
});

(async () => {
    console.log("Starting");
    const repos: string[] = [];

    try {
        let q = `org:${ORG_NAME} ${REPO_PREFIX} in:name fork:true`;
        let parameters = { q };

        for await (const response of octokit.paginate.iterator(octokit.rest.search.repos, parameters)) {
            const found_repos = response.data;
            found_repos.forEach((repo) => {
                repos.push(repo.name);
            });
        }

        repos.sort();

        console.log(`Found ${repos.length} repositories (full list: ${repos})\n\n`);

        q = `org:${ORG_NAME} ${CODE_SEARCH_KEYWORD}`;
        parameters = { q };

        const codeResults: CodeSearchResult[] = [];

        for await (const response of octokit.paginate.iterator(octokit.rest.search.code, parameters)) {
            const occurences = response.data;
            occurences.forEach((item) => {
                if (repos.includes(item.repository.name)) {
                    codeResults.push({
                        repositoryName: item.repository.name,
                        itemPath: item.path,
                        itemHtmlUrl: item.html_url,
                    });
                }
            });
        }

        console.log(`${codeResults.length} code occurences found`);
        codeResults.forEach((result) =>
            console.log(`Repo: ${result.repositoryName},  File: ${result.itemPath}, url: ${result.itemHtmlUrl}`)
        );
    } catch (e) {
        console.error("Caught Exception", e);
    }
})();
