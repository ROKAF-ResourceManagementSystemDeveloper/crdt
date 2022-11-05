package standalone_test

import (
	"context"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"ugboss/crdt/pkg/hub"
	"ugboss/crdt/pkg/hub/standalone"
)

type mockClient struct {
	id   string
	send chan *hub.Message
}

var _ hub.Client = &mockClient{}

// Identifier implements hub.Client
func (c *mockClient) Identifier() string {
	return c.id 
}

// Send implements hub.Client
func (c *mockClient) Send() chan *hub.Message {
	return c.send
}

var _ = Describe("MemoryHub", func() {
	var (
		ctx    context.Context
		cancel context.CancelFunc
		h      hub.Hub
		c1, c2 *mockClient
	)


	BeforeEach(func() {
		ctx, cancel = context.WithCancel(context.TODO())
		h = standalone.NewHub(ctx)

		c1 = &mockClient{id: "1", send: make(chan *hub.Message, 10)}
		c2 = &mockClient{id: "2", send: make(chan *hub.Message, 10)}
	})

	AfterEach(func() {
		cancel()
	})

	Describe("hub", func() {
		It("should send c1 msg to c2", func() {
			b1, err := h.Register(c1, 0)
			Expect(err).NotTo(HaveOccurred())
			_, err = h.Register(c2, 0)
			Expect(err).NotTo(HaveOccurred())

			msg := []byte("send from client1")
			b1(msg)
			b1(msg)

			c1Msg := <-c2.Send()
			Expect(c1Msg.ClientID).To(Equal(c1.id))
			Expect(c1Msg.Offset).To(Equal(0))
			Expect(c1Msg.Data).To(Equal(msg))

			c1Msg = <-c2.Send()
			Expect(c1Msg.ClientID).To(Equal(c1.id))
			Expect(c1Msg.Offset).To(Equal(1))
			Expect(c1Msg.Data).To(Equal(msg))
		})

		It("should send lagged msg to c2", func ()  {
			b1, err := h.Register(c1, 0)
			Expect(err).NotTo(HaveOccurred())

			msg := []byte("send from client1")
			b1(msg) // 0
			b1(msg) // 1
			b1(msg) // 2

			_, err = h.Register(c2, 0)
			Expect(err).NotTo(HaveOccurred())

			b1(msg) // 3

			Expect(len(c2.Send())).To(Equal(4))
		})

		It("should send msg[2,4) to c2", func ()  {
			b1, err := h.Register(c1, 0)
			Expect(err).NotTo(HaveOccurred())

			msg := []byte("send from client1")
			b1(msg) // 0
			b1(msg) // 1
			b1(msg) // 2

			_, err = h.Register(c2, 2)
			Expect(err).NotTo(HaveOccurred())

			b1(msg) // 3

			Expect(len(c2.Send())).To(Equal(2))
		})
	})
})
