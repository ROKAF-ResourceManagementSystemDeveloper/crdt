package standalone

import (
	"context"
	"fmt"
	"ugboss/crdt/pkg/hub"
)

type Hub struct {
	clients    map[string]hub.Client
	register   chan hub.Client
	unregister chan hub.Client
	broadcast  chan []byte
}

var _ hub.Hub = &Hub{}

func NewHub(ctx context.Context) hub.Hub {
	hub := &Hub{
		clients: make(map[string]hub.Client),
		register: make(chan hub.Client),
		unregister: make(chan hub.Client),
		broadcast: make(chan []byte),
	}
	go hub.run(ctx)
	return hub
}

// Register implements hub.Hub
func (h *Hub) Register(cli hub.Client) error {
	select {
	case h.register <- cli:
		return nil
	default:
		return fmt.Errorf("register channel is busy")
	}
}

// Unregister implements hub.Hub
func (h *Hub) Unregister(cli hub.Client) {
	// hub must exectue unregister no matter how long it takes
	h.unregister <- cli
}

// Broadcast implements hub.Hub
func (h *Hub) Broadcast(msg []byte) {
	h.broadcast <- msg
}

func (h *Hub) run(ctx context.Context) {
	for {
		select {
		case client := <- h.register:
			h.clients[client.Identifier()] = client
		case client := <- h.unregister:
			if _, ok := h.clients[client.Identifier()]; ok {
				close(client.Send())
				delete(h.clients, client.Identifier())
			}
		case msg := <- h.broadcast:
			for _, client := range h.clients {
				select {
				case client.Send() <- msg:
				default:
					// TODO
				}
			}
		case <-ctx.Done():
			return
		}
	}
}
