import api from '../api/axios'

export function formatFileSize(bytes) {
  if (bytes === undefined || bytes === null || bytes === '') {
    return ''
  }

  const size = Number(bytes)

  if (size < 1024) {
    return size + ' B'
  }

  if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + ' KB'
  }

  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

export function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleDateString()
}

export async function downloadAttachment(consultationId, file) {
  const response = await api.get(
    `/consultations/${consultationId}/attachments/${encodeURIComponent(file.filename)}`,
    { responseType: 'blob' }
  )

  const url = window.URL.createObjectURL(response.data)
  const link = document.createElement('a')

  link.href = url
  link.download = file.originalName || file.filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
