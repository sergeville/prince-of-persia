#!/bin/zsh
set -eu
project_dir="${0:A:h}"
classic_executable="$project_dir/classic-runtime/sdlpop/1.23/libexec/prince"
if [[ ! -x "$classic_executable" ]]; then
  print -u2 'Classic runtime missing. See docs/CLASSIC-SETUP.md.'
  exit 1
fi
cd "$project_dir/classic-runtime/session"
exec "$classic_executable" "$@"
