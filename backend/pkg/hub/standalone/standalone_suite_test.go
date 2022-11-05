package standalone_test

import (
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

func TestStandalone(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Standalone Suite")
}
