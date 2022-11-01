package hub

type Hub interface {
	Register(cli Client) error
	Unregister(cli Client)
	Broadcast(msg []byte)
}
