export const getImageUrl = (path) => {
  if (!path) return ''

  if (path.startsWith('http')) return path

  return import.meta.env.VITE_UPLOADS_URL + path
}
