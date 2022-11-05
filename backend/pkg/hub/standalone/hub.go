package standalone

import (
	"context"
	"ugboss/crdt/pkg/hub"
)

type clientOffset struct {
	cli    hub.Client
	offset int
}

type memoryHub struct {
	clients    map[string]*clientOffset
	messages   []*hub.Message
	register   chan *clientOffset
	unregister chan hub.Client
	broadcast  chan *hub.Message
}

var _ hub.Hub = &memoryHub{}

func NewHub(ctx context.Context) hub.Hub {
	hub := &memoryHub{
		clients:    make(map[string]*clientOffset),
		messages:   make([]*hub.Message, 0, 1024),
		register:   make(chan *clientOffset),
		unregister: make(chan hub.Client),
		broadcast:  make(chan *hub.Message),
	}
	go hub.run(ctx)
	return hub
}

// Register implements hub.Hub
func (h *memoryHub) Register(cli hub.Client, offset int) (hub.Broadcast, error) {
	h.register <- &clientOffset{cli, offset}
	return func(msg []byte) error {
		h.broadcast <- &hub.Message{
			ClientID: cli.Identifier(),
			Data:     msg,
		}
		return nil
	}, nil
}

// Unregister implements hub.Hub
func (h *memoryHub) Unregister(cli hub.Client) {
	h.unregister <- cli
}

func (h *memoryHub) run(ctx context.Context) {
	for {
		select {
		case clientOffset := <-h.register:
			h.clients[clientOffset.cli.Identifier()] = clientOffset
		case client := <-h.unregister:
			if _, ok := h.clients[client.Identifier()]; ok {
				close(client.Send())
				delete(h.clients, client.Identifier())
			}
		case msg := <-h.broadcast:
			msg.Offset = len(h.messages)
			h.messages = append(h.messages, msg)
		case <-ctx.Done():
			return
		default:
			for _, client := range h.clients {
				readUntil := len(h.messages)
				if client.offset+100 < readUntil {
					readUntil = client.offset + 100
				}
				msgs := h.messages[client.offset:readUntil]
				for _, msg := range msgs {
					if client.cli.Identifier() != msg.ClientID {
						client.cli.Send() <- msg
					}
				}
				client.offset += len(msgs)
			}
		}
	}
}
