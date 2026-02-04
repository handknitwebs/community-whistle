import { IconArrow } from '../components/Icons'

function CodesSection({ codes, title = 'Codes to Learn', note }) {
  return (
    <section id="codes" className="panel codes-panel">
      <h2 className="section-title archivo-800">{title}</h2>
      {note && (
        <p
          className="code-note body-medium roboto-400"
          dangerouslySetInnerHTML={{ __html: note }}
        />
      )}
      {codes.map((code) => (
        <article key={code.title} className="code-card">
          <h3 className="code-title archivo-800">{code.title}</h3>
          <div className="code-rhythm">
            <p className="body-large roboto-400">{code.instruction}</p>
            <p className="rhythm roboto-900">{code.rhythm}</p>
          </div>
          <div className="code-details flex-container flex-dir-col">
            {code.details.map((detail) => (
              <div key={detail} className="code-detail-row body-medium roboto-400">
                <IconArrow />
                <p>{detail}</p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}

export default CodesSection
