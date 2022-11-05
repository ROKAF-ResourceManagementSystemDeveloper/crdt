package hub

type Broadcast func([]byte) error

type Hub interface {
	Register(cli Client, offset int) (Broadcast, error)
	Unregister(cli Client)
}

type Message struct {
	ClientID string `json:"client_id"`
	Offset   int    `json:"offset"`
	Data     []byte `json:"data"`
}
