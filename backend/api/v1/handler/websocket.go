package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"ugboss/crdt/pkg/hub"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Client struct {
	sessionID string
	hub       hub.Hub
	conn      *websocket.Conn
	send      chan *hub.Message
}

var _ hub.Client = &Client{}

// Identifier implements hub.Client
func (cli *Client) Identifier() string {
	return cli.sessionID
}

// Send implements hub.Client
func (cli *Client) Send() chan *hub.Message {
	return cli.send
}

func (cli *Client) readPump(broadcast hub.Broadcast) {
	defer func() {
		cli.hub.Unregister(cli)
		cli.conn.Close()
	}()

	for {
		_, msg, err := cli.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(
				err,
				websocket.CloseGoingAway,
				websocket.CloseAbnormalClosure,
			) {
				// logging
			}
			break
		}
		msg = bytes.TrimSpace(bytes.Replace(msg, []byte("\n"), []byte(" "), -1))
		broadcast(msg)
	}
}

func (cli *Client) writePump() {
	defer func() {
		cli.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-cli.send:
			if !ok {
				cli.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := cli.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			encoder := json.NewEncoder(w)
			encoder.Encode(msg)

			//n := len(cli.send)
			//for i := 0; i < n; i++ {
			//	w.Write([]byte("\n"))
			//	encoder.Encode(<-cli.send)
			//}

			if w.Close() != nil {
				return
			}
		}
	}
}

func WsHandler(h hub.Hub) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		randID := uuid.New().String()
		clientID := ctx.DefaultQuery("name", randID)

		offsetStr := ctx.DefaultQuery("offset", "0")
		offset, err := strconv.Atoi(offsetStr)
		if err != nil {
			ctx.AbortWithError(http.StatusBadRequest, fmt.Errorf("offset must be int value: %v", err))
			return
		}

		conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if err != nil {
			return
		}

		client := &Client{
			sessionID: clientID,
			hub:       h,
			conn:      conn,
			send:      make(chan *hub.Message, 256),
		}
		broadcast, err := h.Register(client, offset)
		if err != nil {
			return
		}

		go client.readPump(broadcast)
		go client.writePump()
	}
}
