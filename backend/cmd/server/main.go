package main

import (
	"fmt"
	"log"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func main() {
	if err := NewCmd().Execute(); err != nil {
		log.Fatal(err)
	}
}

const (
	keyTest = "test"
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
	flags.String(keyTest, "default", "test env binding")
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
	fmt.Println("init project!")
	fmt.Printf("CRDT_BACKEND_TEST: %s\n", vp.GetString(keyTest))
	return nil
}
