#!/bin/bash

root_dir="$(git rev-parse --show-toplevel)/backend"
image=kbzjung359/crdt
version=0.0.1

if [ "${1-}" = "build" ]; then
    echo "build crdt server image: ${image}:${version}"

    cd "${root_dir}"
    docker build -f build/images/Dockerfile -t "${image}:${version}" .
    exit 0
fi

if [ "${1-}" = "run" ]; then
    docker run --rm \
    -e CRDT_BACKEND_TEST="from container" \
    "${image}:${version}"
    exit 0
fi
