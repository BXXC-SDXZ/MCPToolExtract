package mcp

import (
	"context"
	"errors"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

func (s *Server) initSkopeo() []server.ServerTool {
	return []server.ServerTool{
		{mcp.NewTool("valid_architectures",
			mcp.WithDescription("Displays the valid architecture values that the image information can contain"),
		), s.validArchitectures},
		{mcp.NewTool("image_inspect",
			mcp.WithDescription("Displays low level information about a container image, an oci image or an oci archive"),
			mcp.WithString("imageURL", mcp.Description("The pull spec of an image or a path to an oci layout or an oci archive"), mcp.Required()),
		), s.imageInspect},
		{mcp.NewTool("image_inspect_architecture",
			mcp.WithDescription("Check if a particular architecture is supported by the given image."),
			mcp.WithString("imageURL", mcp.Description("The pull spec of an image or a path to an oci layout or an oci archive"), mcp.Required()),
			mcp.WithString("arch", mcp.Description("The architecture to check for to see if an image manifest matching the architecture is present"), mcp.Required()),
		), s.imageInspectWithOSOverride},
		{mcp.NewTool("image_inspect_architectures",
			mcp.WithDescription("Check if multiple architectures are supported by the given image. Check for most common architectures - amd64, arm64, ppc64le and s390x if not specified."),
			mcp.WithString("imageURL", mcp.Description("The pull spec of an image or a path to an oci layout or an oci archive"), mcp.Required()),
			mcp.WithArray("architectures", mcp.Description("The architectures to check for to see if an image manifest matching the architecture is present. "+
				`Example: ["amd64", "arm64", "ppc64le", "s390x"]`),
				// TODO: manual fix to ensure that the items property gets initialized (Gemini)
				// https://www.googlecloudcommunity.com/gc/AI-ML/Gemini-API-400-Bad-Request-Array-fields-breaks-function-calling/m-p/769835?nobounce
				func(schema map[string]interface{}) {
					schema["type"] = "array"
					schema["items"] = map[string]interface{}{
						"type": "string",
					}
				},
				mcp.Required()),
		), s.imageInspectForArches},
	}
}

func (s *Server) imageInspect(_ context.Context, ctr mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	return NewTextResult(s.skopeo.ImageInspect(ctr.Params.Arguments["imageURL"].(string))), nil
}

func (s *Server) imageInspectWithOSOverride(_ context.Context, ctr mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	return NewTextResult(s.skopeo.ImageInspectWithOSOverride(ctr.Params.Arguments["imageURL"].(string), ctr.Params.Arguments["arch"].(string))), nil
}

func (s *Server) imageInspectForArches(_ context.Context, ctr mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	archesArg := ctr.Params.Arguments["architectures"]
	arches := make([]string, 0)
	if _, ok := archesArg.([]interface{}); ok {
		for _, arch := range archesArg.([]interface{}) {
			if _, ok := arch.(string); ok {
				arches = append(arches, arch.(string))
			}
		}
	} else {
		return NewTextResult("", errors.New("failed to exec in pod, invalid arch argument")), nil
	}
	return NewTextResult(s.skopeo.ImageInspectForArches(ctr.Params.Arguments["imageURL"].(string), arches)), nil
}

func (s *Server) validArchitectures(_ context.Context, ctr mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	return NewTextResult(s.skopeo.ValidArchitectures(), nil), nil
}
