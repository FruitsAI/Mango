export const isTrustedDesktopUrl = (url: string, devServerUrl?: string): boolean => {
  if (devServerUrl) {
    return url.startsWith(devServerUrl)
  }

  return url.startsWith('file://')
}
