import Image from "next/image"

interface AppScreenshotProps {
  src?: string
  alt: string
  className?: string
  placeholder?: string
}

export function AppScreenshot({ 
  src, 
  alt, 
  className = "", 
  placeholder = "Coming Soon" 
}: AppScreenshotProps) {
  if (!src) {
    return (
      <div className={`glass-card rounded-lg flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 ${className}`}>
        <div className="text-center p-8">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">App Screenshot</h3>
          <p className="text-sm text-gray-400">{placeholder}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-card rounded-lg overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        priority={false}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => {
          // If image fails to load, show placeholder
          return (
            <div className="glass-card rounded-lg flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 h-full">
              <div className="text-center p-8">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">App Screenshot</h3>
                <p className="text-sm text-gray-400">{placeholder}</p>
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}