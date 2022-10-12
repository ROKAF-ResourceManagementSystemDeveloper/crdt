FROM golang:1.18.5-alpine AS builder

ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

WORKDIR /build
COPY . .

RUN go mod download

WORKDIR /build/cmd/server
RUN go build -o crdt .

WORKDIR /dist
RUN cp /build/cmd/server/crdt .

FROM alpine:latest
COPY --from=builder /dist/crdt /bin

ENTRYPOINT ["/bin/crdt"]