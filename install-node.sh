#!/usr/bin/env bash

CURL_PARAMS=(
  "-L"
  "-#"
)

BASE_URL="https://nodejs.org/dist"
INDEX_URL="$BASE_URL/index.tab"

latest_version() {
  curl -L --silent "$INDEX_URL" | head -n2 | tail -n1 | awk '{print $1}'
}

# based on n (https://github.com/tj/n/blob/master/bin/n)
tarball_url() {
  local version=$1
  local uname="$(uname -a)"
  local arch=x86
  local os=

  case "$uname" in
    Linux*) os=linux ;;
    Darwin*) os=darwin ;;
    SunOS*) os=sunos ;;
  esac

  case "$uname" in
    *x86_64*) arch=x64 ;;
  esac

  echo "${BASE_URL}/${version}/node-${version}-${os}-${arch}.tar.gz"
}

main() {
  local latest="$(latest_version)"
  local url="$(tarball_url $latest)"
  echo "$url"
  curl "${CURL_PARAMS[@]}" "$url" \
    | tar -zx --strip-components=1 -C /usr/local \
    && node -v \
    && npm -v
}

main
