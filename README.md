# What is it?
A small typescript tool to search for code in GH in a given org with a given repository prefix (e.g. a team name).

So if you have repos like `https://github.com/myorg/myteam-some-repo-1/` and `https://github.com/myorg/myteam-some-repo-2/`, but there are also repos like `https://github.com/myorg/anotherteam-some-repo-1/`, then this tool allows you to limit the search to only the repos of `myteam`

# How to use?

## Preriquiste

Have a token with permissions to list repos in the environment as `GITHUB_TOKEN`.

## General set up

There are two use cases supported:
- Search for code
- Search for files with a name pattern

For both use cases:

Clone the repo and create a file named `.env` in the folder with the following content:

```
ORG_NAME=
REPO_PREFIX=
```

Set the values with
- ORG_NAME (required): GitHub organization
- REPO_PREFIX (required): Prefix of repos which should be included in search

## Use case: code search

just run `./run.sh <code-search-keyword>`

or (old way) add to the `.env` file the following variable:
`CODE_SEARCH_KEYWORD=<code>`
with the keyword you want to search for in the code

## Use case file pattern search:

Add to the `.env` file the following variable:
`FILE_NAME=<pattern>`
with a file name pattern to search for, then run 

```
npx ts-node index.ts
```
