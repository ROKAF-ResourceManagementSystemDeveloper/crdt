package hub

type Client interface {
	Identifier() string
	Send() chan []byte
}