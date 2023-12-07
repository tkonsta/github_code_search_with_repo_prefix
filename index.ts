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

console.log(`Searching for ${CODE_SEARCH_KEYWORD} in organization ${ORG_NAME} and repo-prefix ${REPO_PREFIX}`);

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
    const repos: string[] = [];

    try {
        octokit.log.warn("Starting");
        let q = `org:${ORG_NAME} ${REPO_PREFIX}`;
        let res = await octokit.rest.search.repos({
            q,
        });

        if (res.status == 200) {
            octokit.log.warn("Successful request to GH API");
        } else {
            octokit.log.warn("Request to GH API failed");
        }

        octokit.log.warn("Found number of repositories: " + res.data.total_count);
        res.data.items.forEach((item) => {
            repos.push(item.name);
            octokit.log.warn(item.name);
        });

        q = `org:${ORG_NAME} ${CODE_SEARCH_KEYWORD}`;

        const parameters = { q };

        for await (const response of octokit.paginate.iterator(octokit.rest.search.code, parameters)) {
            const occurences = response.data;
            console.log("%d code occurences found", occurences.length);
            occurences.forEach((item) => {
                if (repos.includes(item.repository.name)) {
                    console.log(`Repo: ${item.repository.name},  File: ${item.path}, url: ${item.html_url}`);
                }
            });
        }
    } catch (e) {
        console.error("Caught Exception", e);
    }
})();
