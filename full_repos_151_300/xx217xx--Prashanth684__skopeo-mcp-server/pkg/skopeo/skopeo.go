package skopeo

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/containers/image/v5/image"
	"github.com/containers/image/v5/transports/alltransports"
	"github.com/containers/image/v5/types"
)

type skopeoLib struct{}

var architectures = []string{
	"386", "amd64", "amd64p32", "arm", "arm64",
	"loong64", "mips", "mipsle", "mips64", "mips64le",
	"ppc64", "ppc64le", "riscv64", "s390x", "wasm",
}

// ValidArchitectures - list of all the valid architecture values in an image
func (s *skopeoLib) ValidArchitectures() string {
	return strings.Join(architectures, ", ")
}

// ImageInspect - inspects a docker container image
// TODO: oci-archive needs disk access which we will do later - need the filesystem mcp
func (s *skopeoLib) ImageInspect(name string) (string, error) {
	return inspectImage(name, "")
}

// ImageInspectWithOSOverride - inspects a docker container image by overriding the arch to check if an image manifest is available for that specific arch
func (s *skopeoLib) ImageInspectWithOSOverride(name, arch string) (string, error) {
	return inspectImage(name, arch)
}

// ImageInspectForAllArches displays the low-level information for all suppported architecture variants of the image
func (s *skopeoLib) ImageInspectForArches(name string, arches []string) (string, error) {
	var results []string
	for _, arch := range arches {
		result, err := inspectImage(name, arch)
		if err != nil {
			return "", err
		}
		results = append(results, result)
	}
	return strings.Join(results, " "), nil
}

// inspectImage inspects the image and gets the metadata and other info of the image
func inspectImage(name, arch string) (string, error) {
	ctx := context.Background()
	sysCtx := &types.SystemContext{}
	if arch != "" {
		sysCtx.ArchitectureChoice = arch
	}

	ref, err := alltransports.ParseImageName("docker://" + name)
	if err != nil {
		return "", fmt.Errorf("invalid image name: %w", err)
	}

	imgSrc, err := ref.NewImageSource(ctx, sysCtx)
	if err != nil {
		return "", fmt.Errorf("creating image source: %w", err)
	}
	defer imgSrc.Close()

	img, err := image.FromSource(ctx, sysCtx, imgSrc)
	if err != nil {
		return "", fmt.Errorf("loading image: %w", err)
	}
	defer img.Close()

	inspectInfo, err := img.Inspect(ctx)
	if err != nil {
		return "", fmt.Errorf("inspect failed: %w", err)
	}

	// Remove tag info by clearing Tag field (or omit displaying it)
	inspectInfo.LayersData = nil
	inspectInfo.Layers = nil
	inspectInfo.Labels = nil

	data, err := json.MarshalIndent(inspectInfo, "", "  ")
	if err != nil {
		return "", fmt.Errorf("marshal error: %w", err)
	}

	return string(data), nil
}

func NewSkopeoLib() *skopeoLib {
	return &skopeoLib{}
}
