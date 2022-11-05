package main

import (
	"context"
	"fmt"
	"log"
	"ugboss/crdt/api/v1/handler"
	"ugboss/crdt/pkg/hub/standalone"

	"github.com/gin-gonic/gin"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func main() {
	if err := NewCmd().Execute(); err != nil {
		log.Fatal(err)
	}
}

const (
	keyHost = "host"
	keyPort = "port"
)

func NewCmd() *cobra.Command {
	vp := newViper()

	cmd := &cobra.Command{
		Use:   "crdt",
		Short: "crdt backend server",
		RunE: func(_ *cobra.Command, _ []string) error {
			return runServer(vp)
		},
	}

	flags := cmd.Flags()
	flags.String(keyHost, "0.0.0.0", "addr to listen reqeust")
	flags.String(keyPort, "8080", "port to listen reqeust")
	vp.BindPFlags(flags)

	return cmd
}

func newViper() *viper.Viper {
	vp := viper.New()
	vp.SetEnvPrefix("crdt_backend")
	vp.AutomaticEnv()
	return vp
}

func runServer(vp *viper.Viper) error {	
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	hub := standalone.NewHub(ctx)

	r := gin.Default()
	r.GET("/ws", handler.WsHandler(hub))
	return r.Run(fmt.Sprintf("%s:%s", vp.GetString(keyHost), vp.GetString(keyPort)))
}
