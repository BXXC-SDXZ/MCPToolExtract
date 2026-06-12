package skopeo

// Skopeo interface
type Skopeo interface {
	// Displays the valid architecture values an image can have
	ValidArchitectures() string
	// ImageInspect displays the low-level information for images identified by the ID or name
	ImageInspect(name string) (string, error)
	// ImageInspectWithOSOverride displays the low-level information for the architecture variant of the images identified by the ID or name
	ImageInspectWithOSOverride(name string, arch string) (string, error)
	// ImageInspectForArches displays the low-level information for all suppported architecture variants of the image
	ImageInspectForArches(name string, arches []string) (string, error)
	// ImageCopy copies all the manifests of the image to a registry or ociarchive
	//ImageCopy() (string, error)
}

func NewSkopeo() Skopeo {
	return NewSkopeoLib()
}
