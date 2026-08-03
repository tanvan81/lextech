/**
 * Formats video and document URLs for embedding safely inside iframe players.
 * Specifically converts Google Drive / Docs view and edit URLs to /preview format.
 */
export function formatEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Convert Youtube watch?v= to embed/
  if (trimmed.includes('youtube.com/watch?v=')) {
    return trimmed.replace('watch?v=', 'embed/');
  }
  if (trimmed.includes('youtu.be/')) {
    const parts = trimmed.split('youtu.be/')[1]?.split('?')[0];
    if (parts) {
      return `https://www.youtube.com/embed/${parts}`;
    }
  }

  // Google Drive & Google Docs format conversion for clean iframe preview
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    // 1. /file/d/FILE_ID/view or /file/d/FILE_ID/edit
    if (trimmed.includes('/file/d/')) {
      const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    // 2. /open?id=FILE_ID or /uc?id=FILE_ID
    if (trimmed.includes('id=')) {
      const match = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    // 3. Google Docs document
    if (trimmed.includes('/document/d/')) {
      const match = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://docs.google.com/document/d/${match[1]}/preview`;
      }
    }

    // 4. Google Slides presentation
    if (trimmed.includes('/presentation/d/')) {
      const match = trimmed.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`;
      }
    }

    // 5. Google Sheets
    if (trimmed.includes('/spreadsheets/d/')) {
      const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://docs.google.com/spreadsheets/d/${match[1]}/pubhtml?widget=true&headers=false`;
      }
    }
  }

  return trimmed;
}

/**
 * Gets a clean direct view / external link for Google Drive / Docs or other external media
 */
export function getExternalViewUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('/preview')) {
    return trimmed.replace('/preview', '/view');
  }
  return trimmed;
}
