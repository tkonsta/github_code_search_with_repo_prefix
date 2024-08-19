if [ -n "$1" ]; then
  export CODE_SEARCH_KEYWORD="${1}"
  echo "Set CODE_SEARCH_KEYWORD to ${CODE_SEARCH_KEYWORD}"
fi
npx ts-node index.ts