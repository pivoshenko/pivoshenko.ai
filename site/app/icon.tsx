import Icon from 'pivoshenko.ui/next/icon'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

// wrapped rather than re-exported, so the mark's chip matches the site accent
export default function SiteIcon() {
  return Icon({ accent: 'lavender' })
}
