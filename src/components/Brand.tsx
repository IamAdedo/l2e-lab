type BrandProps = {
  inverse?: boolean
  compact?: boolean
}

export function Brand({ inverse = false, compact = false }: BrandProps) {
  return (
    <div className={`brand ${inverse ? 'brand--inverse' : ''} ${compact ? 'brand--compact' : ''}`} aria-label="Learn2Earn LAB">
      <img className="brand__official" src={inverse ? '/learn2earn-white.png' : '/learn2earn-logo.svg'} alt="Learn2Earn" />
      <span className="brand__lab">LAB</span>
    </div>
  )
}

export function Learn2EarnSignature({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`signature ${inverse ? 'signature--inverse' : ''}`}>
      <span>Built for</span>
      <img
        src={inverse ? '/learn2earn-white.png' : '/learn2earn-logo.svg'}
        alt="Learn2Earn"
      />
    </div>
  )
}
