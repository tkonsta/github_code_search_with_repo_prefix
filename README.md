# What is it?
A small typescript tool to search for code in GH in a given org with a given repository prefix (e.g. a team name)

# How to use?

Clone the repo and create a file named `.env` in the folder with the following content:

```
ORG_NAME=
REPO_PREFIX=
CODE_SEARCH_KEYWORD=
```

Set the values for org, repo prefix and what you want to search for in code and then run with 

```
npx ts-node index.ts
```
