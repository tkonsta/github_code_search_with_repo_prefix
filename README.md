# What is it?
A small typescript tool to search for code in GH in a given org with a given repository prefix (e.g. a team name).

So if you have repos like `https://github.com/myorg/myteam-some-repo-1/` and `https://github.com/myorg/myteam-some-repo-2/`, but there are also repos like `https://github.com/myorg/anotherteam-some-repo-1/`, then this tool allows you to limit the search to only the repos of `myteam`

# How to use?

Clone the repo and create a file named `.env` in the folder with the following content:

```
ORG_NAME=
REPO_PREFIX=
FILE_NAME=
CODE_SEARCH_KEYWORD=
```

Set the values with
- ORG_NAME (required): GitHub organization
- REPO_PREFIX (required): Prefix of repos which should be included in search
- FILE_NAME (optional): File name pattern to search for. If FILE_NAME is given, then CODE_SEARCH_KEYWORD can be empty
- CODE_SEARCH_KEYWORD (required if no FILE_NAME is given): The keyword you want to search for in the code

Have a token with permissions to list repos in the environment as `GITHUB_TOKEN`.

Then run with 

```
npx ts-node index.ts
```
