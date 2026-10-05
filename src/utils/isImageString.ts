export const isImageFile = (filename: string) => {
  // Convert the filename to lowercase to handle case-insensitive comparison
  const lowerCaseFilename = filename.toLowerCase()

  // List of common image file extensions
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".tiff",
    ".svg",
    ".ico",
    ".heic",
    ".avif",
  ]

  // Find the last dot in the filename (to get the file extension)
  const lastDotIndex = lowerCaseFilename.lastIndexOf(".")

  // If there's no dot, it's not a valid file with an extension
  if (lastDotIndex === -1) {
    return false
  }

  // Extract the file extension
  const fileExtension = lowerCaseFilename.substring(lastDotIndex)

  // Check if the file extension is in the list of image extensions
  return imageExtensions.includes(fileExtension)
}
