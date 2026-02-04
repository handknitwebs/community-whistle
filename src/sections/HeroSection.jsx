function HeroSection({
  image,
  imageAlt = 'Illustration of a whistle rallying a crowd',
  titleLines = [],
  note = ''
}) {
  const [firstLine = 'Together,', secondLine = 'we keep our community safe.'] = titleLines
  const normalizedImage = typeof image === 'string' ? { src: image } : image || {}
  const {
    src,
    srcSet,
    webpSrcSet,
    width,
    height,
    sizes
  } = normalizedImage

  return (
    <section className="panel hero-panel" aria-labelledby="hero-title">
      <h1 id="hero-title" className="display-title archivo-800">
        {firstLine}
        <br />
        {secondLine}
      </h1>
      <div className="hero-image" role="presentation">
        <picture>
          {webpSrcSet && (
            <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
          )}
          <img
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            width={width}
            height={height}
            alt={imageAlt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>
      {note && (
        <p
          className="hero-note body-medium roboto-400"
          dangerouslySetInnerHTML={{ __html: note }}
        />
      )}
    </section>
  )
}

export default HeroSection
