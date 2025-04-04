import { Octokit } from "octokit";
import "dotenv/config";
import { exit } from "process";

const ORG_NAME = process.env.ORG_NAME;
const REPO_PREFIX = process.env.REPO_PREFIX;
const FILE_NAME = process.env.FILE_NAME;
const CODE_SEARCH_KEYWORD = process.env.CODE_SEARCH_KEYWORD;

if (!ORG_NAME || !REPO_PREFIX || (!CODE_SEARCH_KEYWORD && !FILE_NAME)) {
    console.log("Missing parameters. Please set them in .env file!");
    exit(1);
}

interface CodeSearchResult {
    path: string;
    htmlUrl: string;
}

type CodeSearchResultsPerRepo = {[repoName: string]: CodeSearchResult[]};


async function addToCodeResults(codeResults: CodeSearchResultsPerRepo, repo: string, item: CodeSearchResult) {
    const alreadyAvailableResults = codeResults[repo];
    if (!alreadyAvailableResults) {
        codeResults[repo] = [];
    }

    codeResults[repo].push(item);
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
            found_repos.forEach((repo: any) => {
                repos.push(repo.name);
            });
        }

        repos.sort();

        console.log(`Found ${repos.length} repositories (full list: ${repos})\n\n`);

        if (FILE_NAME) {
            q = `org:${ORG_NAME} filename:${FILE_NAME} ${CODE_SEARCH_KEYWORD}`;
        } else {
            q = `org:${ORG_NAME} ${CODE_SEARCH_KEYWORD}`;
        }
        
        parameters = { q };

        const codeResults: CodeSearchResultsPerRepo = {};
        let numberOfResults = 0;

        for await (const response of octokit.paginate.iterator(octokit.rest.search.code, parameters)) {
            const occurences = response.data;
            occurences.forEach((item: any) => {
                if (repos.includes(item.repository.name)) {
                    numberOfResults++;
                    addToCodeResults(codeResults, item.repository.name, {
                        path: item.path,
                        htmlUrl: item.html_url,
                    });
                }
            });
        }

        console.log(`${numberOfResults} code occurences found`);
        for (let key in codeResults) {
            console.log(`\nResults for repository ${key}`);
            codeResults[key].forEach(item => {
                console.log(`   File: ${item.path}, url: ${item.htmlUrl}`)
            })
        }        
    } catch (e) {
        console.error("Caught Exception", e);
    }
})();
