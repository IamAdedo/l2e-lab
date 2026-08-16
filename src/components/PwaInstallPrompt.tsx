import { useEffect, useState } from 'react'
import { Download, Share2 } from 'lucide-react'

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<{ prompt: () => Promise<void> } | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault()
      setDeferred({ prompt: () => event.prompt() })
      setTimeout(() => setVisible(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    }
  }, [])

  if (!visible || !deferred) return null

  async function handleInstall() {
    if (deferred) {
      await deferred.prompt()
    }
    setVisible(false)
    setDeferred(null)
  }

  return (
    <div className="pwa-install-prompt">
      <button type="button" className="pl-button pl-button--secondary" onClick={handleInstall}>
        <Download size={14} /> Install L2E LAB
      </button>
      <button type="button" className="pwa-install-prompt__dismiss" onClick={() => setVisible(false)} aria-label="Dismiss install prompt">
        <Share2 size={12} />
      </button>
    </div>
  )
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<'accepted' | 'rejected'>
}
