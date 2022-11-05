# Build

## Build Image

```bash
$ sh build.sh build
```

## Run Image

```bash
$ sh build.sh run 8080 // 바인드할 포트를 2번째 인자로 전달

$ docker run --rm \
    -p "8080:8080" \
    "kbzjung359/crdt:0.0.1"
```