import { Fragment, type CSSProperties, type ReactNode } from 'react'
import type { SiteContent } from '@/lib/content/types'
import { asset, assetV, isExternal, mediaUrl, rt } from '@/lib/content/text'
import { sinceLabel, type IndexPayload } from '@/lib/index-data'
import { FLOW_FS, FLOW_VS } from './shaders'
import LegacyScripts from './LegacyScripts'

/* The prototype's markup (prototype/extracted/index.html), class for class, with
   the copy coming from the CMS. The behaviour is the prototype's own scripts,
   loaded once the page has hydrated - see LegacyScripts. */

type Props = { content: SiteContent; index: IndexPayload; banner?: ReactNode }

const iv = (i: number, extra?: CSSProperties) => ({ '--i': i, ...extra }) as CSSProperties

/* Override the built-in logo mask with a custom silhouette; the CSS keeps the
   no-repeat/center/contain and the currentColor fill. */
const maskStyle = (url: string): CSSProperties => ({
  WebkitMaskImage: `url("${url}")`,
  maskImage: `url("${url}")`,
})

/** Renders editor text through rt(). */
function T({ as: Tag = 'span', html, ...rest }: { as?: 'p' | 'span' | 'h1' | 'h2' | 'h3'; html: string } & Record<string, unknown>) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />
}

function linkProps(href: string, newTab = isExternal(href)) {
  return newTab ? { href: href || '#', target: '_blank', rel: 'noopener' } : { href: href || '#' }
}

const Ring = () => (
  <svg className="rb-btn__ring" viewBox="0 0 44 44"><circle cx="22" cy="22" r="21" /></svg>
)
const Arrow = () => (
  <>
    <span className="rb-btn__arrow" />
    <Ring />
  </>
)
const Close = () => (
  <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" /></svg>
)

/* A hidden field only a bot fills in. See /api/forms. */
const Honeypot = () => (
  <input
    type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" data-hp=""
    style={{ position: 'absolute', left: -10000, width: 1, height: 1, opacity: 0 }}
  />
)

const PILLAR_ICONS = {
  research: (
    <svg className="pico" viewBox="0 0 48 48" aria-hidden="true"><path d="M13 11h16v18" /><path d="M13 11v26h11" /><path d="M17 17h8M17 21h8" /><circle cx="30" cy="29" r="7" /><path d="M35 34l4 4" /></svg>
  ),
  data: (
    <svg className="pico" viewBox="0 0 48 48" aria-hidden="true"><path d="M10 32h28" /><path d="M10 23 17 26 24 20 31 23 38 17" /><circle cx="38" cy="17" r="1.8" className="pico__d" /></svg>
  ),
  tools: (
    <svg className="pico" viewBox="0 0 48 48" aria-hidden="true"><path d="M14 9h20v30H14z" /><path d="M18 14h12v5H18z" /><circle cx="19" cy="25" r="1.4" className="pico__d" /><circle cx="24" cy="25" r="1.4" className="pico__d" /><circle cx="29" cy="25" r="1.4" className="pico__d" /><circle cx="19" cy="31" r="1.4" className="pico__d" /><circle cx="24" cy="31" r="1.4" className="pico__d" /><circle cx="29" cy="31" r="1.4" className="pico__d" /></svg>
  ),
}

export default function SitePage({ content: c, index, banner }: Props) {
  return (
    <>
      {banner}
      <div className="scroll-bar" id="scrollBar" />

      {/* ---------- site header ---------- */}
      <header className="wf-header" id="siteHeader">
        <div className="container">
          <div className="wf-bar">
            <nav className="wf-nav wf-nav--l">
              {c.header.left.map((l, i) => <a key={i} {...linkProps(l.href)}>{l.label}</a>)}
            </nav>
            <a
              className="wf-logo"
              href={c.header.logoHref || '#'}
              aria-label="RedBook"
              style={c.header.logoImage ? maskStyle(mediaUrl(c.header.logoImage)) : undefined}
            />
            <nav className="wf-nav wf-nav--r">
              {c.header.right.map((l, i) => (
                <a key={i} {...linkProps(l.href)} className={l.active ? 'is-active' : undefined}>{l.label}</a>
              ))}
            </nav>
            <button className="wf-menu" id="menuBtn" type="button" aria-expanded="false" aria-controls="mobileMenu">{c.header.menuLabel}</button>
          </div>
        </div>
      </header>

      <nav className="sec-nav" id="secNav" aria-label="Sections">
        <div className="sec-nav__track">
          {c.nav.items.map((n) => (
            <a key={n.anchor} href={`#${n.anchor}`} data-sec={n.anchor}>
              <span className="sn-f">{n.long}</span><span className="sn-s">{n.short}</span>
            </a>
          ))}
        </div>
      </nav>

      <Hero c={c} />
      <About c={c} />
      <Pillars c={c} />
      <Reports c={c} />
      <IndexSection c={c} index={index} />
      <Tools c={c} />
      <Exchange c={c} />
      <Newshub c={c} />
      <Footer c={c} />

      <script id="rbFlowVS" type="x-shader/x-vertex" dangerouslySetInnerHTML={{ __html: FLOW_VS }} />
      <script id="rbFlowFS" type="x-shader/x-fragment" dangerouslySetInnerHTML={{ __html: FLOW_FS }} />

      <nav className="rail" id="rail" aria-label="Page navigation">
        <button className="rail__b rail__top" data-act="top" aria-label="Back to top">
          <svg className="ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" /></svg>
          <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h12" /><path d="M12 19V9" /><path d="M8 13l4-4 4 4" /></svg>
        </button>
        <span className="rail__gap" />
        <div className="rail__pair">
          <button className="rail__b" data-act="prev" aria-label="Previous section">
            <svg className="ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" /></svg>
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6" /><path d="M7 11l5-5 5 5" /></svg>
          </button>
          <span className="rail__sep" />
          <button className="rail__b" data-act="next" aria-label="Next section">
            <svg className="ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" /></svg>
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v13" /><path d="M7 13l5 5 5-5" /></svg>
          </button>
        </div>
      </nav>

      <RequestDialog c={c} />
      <MobileMenu c={c} />

      <LegacyScripts
        srcs={[
          '01-hero-flow.js', '02-page.js', '03-nav-rail.js', '04-reveal-settle.js',
          '05-pillar-flow.js', '06-request-dialog.js', '07-email-validation.js',
          '08-mobile-menu.js',
        ].map((f) => assetV(`/assets/js/${f}`))}
      />
    </>
  )
}

/* ================= 01 - HERO ================= */
function Hero({ c }: { c: SiteContent }) {
  const lines = c.hero.headline.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  return (
    <section className="hero" id="hero">
      <canvas className="hero__flow" id="heroFlow" aria-hidden="true" />
      <div className="hero__scrim" />
      <div className="container hero__inner">
        <T as="p" className="eyebrow hero__eyebrow" data-reveal="" html={rt(c.hero.eyebrow)} />
        <h1 className="h-display" id="heroHeadline">
          {lines.map((line, i) => (
            <span className="ln" key={i}>
              <span className="ln__i" data-text={line} style={iv(i)}>{line}</span>
            </span>
          ))}
        </h1>
        <T as="p" className="lede" data-reveal="" style={iv(4, { marginTop: 30 })} html={rt(c.hero.standfirst)} />
        <div className="btn-row" data-reveal="" style={iv(5)}>
          <a className="rb-btn rb-btn--light rb-btn--boxed" href={c.hero.buttonHref || '#pillars'}>{c.hero.buttonLabel}</a>
        </div>
      </div>
    </section>
  )
}

/* ================= 02 - ABOUT ================= */
function About({ c }: { c: SiteContent }) {
  const a = c.about
  return (
    <section className="section" id="about">
      <div className="container">
        <T as="p" className="eyebrow eyebrow--red" data-reveal="" html={rt(a.eyebrow)} />
        <T as="h2" className="h-1" data-reveal="" style={iv(1)} html={rt(a.headline)} />
        <div className="about-row about-note" style={{ marginTop: 38 }}>
          <T as="p" className="value__c" data-reveal="" html={rt(a.body)} />
        </div>
        <div className="grid g-4 about-row figures" style={{ marginTop: 46 }}>
          {a.figures.map((f, i) => (
            <div className="figure" data-reveal="" style={iv(i)} key={i}>
              <p className="figure__n" data-count={f.count} data-prefix={f.prefix || undefined} data-suffix={f.suffix || undefined}>0</p>
              <T as="p" className="figure__l" html={rt(f.label)} />
            </div>
          ))}
        </div>
        {a.footnote && <T as="p" className="figure__note" html={rt(a.footnote).replace(/^\* /, '*&nbsp;')} />}
      </div>
    </section>
  )
}

/* ================= 03 - PILLARS ================= */
function Pillars({ c }: { c: SiteContent }) {
  const p = c.pillars
  return (
    <section className="section section--parch" id="pillars">
      <div className="container">
        <div className="grid g-12" style={{ marginBottom: 38 }}>
          <div className="span-12">
            <T as="p" className="eyebrow eyebrow--red" data-reveal="" html={rt(p.eyebrow)} />
            <T as="h2" className="h-2" data-reveal="" style={iv(1, { marginBottom: 0 })} html={rt(p.headline)} />
          </div>
        </div>
        <div className="pgrid">
          {p.cards.map((card, i) => (
            <a key={i} className="pcard" {...linkProps(card.href)} data-reveal="" style={iv(i)}>
              <div className="pcard__media">
                <canvas className="pcard__flow" aria-hidden="true" />
                {PILLAR_ICONS[card.icon] ?? PILLAR_ICONS.research}
                <span className="pcard__cap">{card.label}</span>
              </div>
              <p className="pcard__name">{card.label}</p>
              <T as="p" className="pcard__copy" html={rt(card.body)} />
              <div className="pcard__foot">
                <span className="rb-btn" style={{ pointerEvents: 'none' }}>{card.linkLabel}
                  <Arrow />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================= 04 - REPORTS ================= */
const LOCK = (
  <span className="cover__lock" aria-label="Restricted">
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="1.5" /><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" /></svg>
  </span>
)

function Reports({ c }: { c: SiteContent }) {
  const r = c.reports
  return (
    <section className="section" id="reports">
      <div className="container">
        <div className="grid g-12" style={{ marginBottom: 38 }}>
          <div className="span-12">
            <T as="p" className="eyebrow eyebrow--red" data-reveal="" html={rt(r.eyebrow)} />
            <T as="h2" className="h-1 h-1--nowrap" data-reveal="" style={iv(1)} html={rt(r.headline)} />
            <T as="p" className="lede" data-reveal="" style={iv(2, { margin: '22px 0 0', maxWidth: 640 })} html={rt(r.standfirst)} />
          </div>
        </div>

        <div className="rep-bar" data-reveal="">
          <span className="rep-bar__l">{r.yearLabel}</span>
          <span className="rep-sel">
            <label className="sr-only" htmlFor="repYear">Report year</label>
            <select id="repYear" autoComplete="off" defaultValue={r.years[0]?.year}>
              {r.years.map((y) => <option key={y.year} value={y.year}>{y.year}</option>)}
            </select>
          </span>
        </div>

        {r.years.map((y, yi) => (
          <div className="grid g-3" style={{ marginBottom: 38 }} data-repyear={y.year} hidden={yi > 0} key={y.year}>
            {y.reports.map((card, i) => {
              const ordinal = /^\d+$/.test(card.label.trim())
              const inner = (
                <>
                  <span className="cover__plate">
                    <img className="cover__img" src={mediaUrl(card.image)} alt="" loading={yi > 0 ? 'lazy' : undefined} />
                    <span className="cover__hint">{r.hintLabel}</span>
                    {card.locked && LOCK}
                  </span>
                  <span className="cover__cap">
                    {card.label.trim() && (
                      <T className={ordinal ? 'cover__n' : 'cover__n cover__n--label'} html={rt(card.label)} />
                    )}
                    <T className="cover__t" html={rt(card.title)} />
                    {card.published && <span className="cover__d">Published {card.published}</span>}
                  </span>
                </>
              )
              return (
                <div data-reveal="" style={iv(i)} key={i}>
                  {card.locked ? (
                    <div className="cover cover--locked" aria-disabled="true" title={r.lockedTitle}>{inner}</div>
                  ) : (
                    <a className="cover" {...linkProps(card.href, card.newTab)}>{inner}</a>
                  )}
                  {card.blurb && <T as="p" className="small" style={{ marginTop: 16 }} html={rt(card.blurb)} />}
                </div>
              )
            })}
          </div>
        ))}

        {r.years.map((y, yi) =>
          y.future.length ? (
            <Fragment key={y.year}>
              <div className="row-intro" data-reveal="" data-repyear={y.year} hidden={yi > 0}>
                <T as="p" className="eyebrow eyebrow--red" html={rt(r.futureHeading)} />
              </div>
              <div className="row-list" data-reveal="" data-repyear={y.year} hidden={yi > 0}>
                {y.future.map((f, i) => (
                  <div className="row-item" key={i}>
                    <span className="row-item__idx">{f.ordinal}</span>
                    <T className="row-item__t" html={rt(f.title)} />
                    <T className="row-item__d" html={rt(f.description)} />
                    <span className="row-item__w">Coming {f.due}</span>
                  </div>
                ))}
              </div>
            </Fragment>
          ) : null,
        )}
      </div>
    </section>
  )
}

/* ================= 05 - THE INDEX ================= */
function IndexSection({ c, index }: { c: SiteContent; index: IndexPayload }) {
  const x = c.index
  const { meta } = index
  /* `<` escaped so a label can never close the script block */
  const json = JSON.stringify(index).replace(/</g, '\\u003c')
  return (
    <section className="section section--parch" id="index">
      <div className="container">
        <div className="grid g-12" style={{ marginBottom: 38 }}>
          <div className="span-12">
            <T as="p" className="eyebrow eyebrow--red" data-reveal="" html={rt(x.eyebrow)} />
            <T as="h2" className="h-1 h-1--nowrap" data-reveal="" style={iv(1)} html={rt(x.headline)} />
            <T as="p" className="lede" data-reveal="" style={iv(2, { margin: '22px 0 0', maxWidth: 640 })} html={rt(x.standfirst)} />
          </div>
        </div>

        <div className="idx-tile" id="indexTile">
          <div className="idx-bar">
            <div className="seg" id="regionSeg" role="group" aria-label="Region">
              {meta.regions.map((r, i) => (
                <button key={r.key} className={i === 0 ? 'seg__b is-on' : 'seg__b'} type="button" data-region={r.key} aria-pressed={i === 0}>
                  {r.label}
                </button>
              ))}
            </div>
            <div className="cx" id="cx">
              <button className="cx__btn" type="button" id="cxBtn" aria-expanded="false" aria-controls="cxPanel">
                {x.customiseLabel}<i />
              </button>
              <div className="cx__panel" id="cxPanel" hidden>
                <div className="cx__head">
                  <p className="cx__note" id="cxNote" data-note={x.pickerNote} data-full={x.pickerNoteFull}>{x.pickerNote}</p>
                  <button className="cx__x" type="button" id="cxClose" aria-label="Close"><Close /></button>
                </div>
                <div id="cxRows" />
                <div className="cx__foot">
                  <button type="button" className="cx__clear" id="cxClear">{x.clearLabel}</button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid g-12" style={{ alignItems: 'start' }}>
            <div className="span-7" data-reveal="">
              <div className="chart">
                <span className="chart__y chart__y--hi">{meta.axis.head}</span>
                <span className="chart__y chart__y--lo">{meta.axis.foot}</span>
                <span className="chart__tip" id="chartTip" aria-hidden="true" />
                <svg viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true">
                  <g id="clines" />
                </svg>
              </div>
              <div className="chart__x">
                {meta.readings.map((r) => <span key={r}>{r}</span>)}
              </div>
              <div className="chart__legend" id="chartLegend" />
            </div>
            <div className="span-5 pl-col">
              <div className="index-stats">
                <div className="stat-head">
                  <span /><span>{sinceLabel(meta.readings)}</span><span>{x.baseColumnLabel}</span>
                </div>
                <div id="statRows" />
              </div>
            </div>
          </div>
          <div className="spine-actions">
            <a className="rb-btn" href="#" id="exportGraph">{x.exportLabel}
              <Arrow />
            </a>
            <a className="rb-btn" href="#" id="reqIndex">{x.requestLabel}
              <Arrow />
            </a>
          </div>
        </div>
      </div>
      <script id="rbIndexData" type="application/json" dangerouslySetInnerHTML={{ __html: json }} />
    </section>
  )
}

/* ================= 06 - TOOLS ================= */
function Tools({ c }: { c: SiteContent }) {
  const t = c.tools
  return (
    <section className="section" id="tools">
      <div className="container">
        <div className="grid g-12" style={{ marginBottom: 38 }}>
          <div className="span-12">
            <T as="p" className="eyebrow eyebrow--red" data-reveal="" html={rt(t.eyebrow)} />
            <T as="h2" className="h-1 h-1--nowrap" data-reveal="" style={iv(1)} html={rt(t.headline)} />
            <T as="p" className="lede" data-reveal="" style={iv(2, { margin: '22px 0 0' })} html={rt(t.standfirst)} />
          </div>
        </div>
        <div className="tools">
          {t.tools.map((tool, i) =>
            tool.state === 'live' ? (
              <a key={i} className="tbox tbox--live" {...linkProps(tool.href)} data-reveal="" style={iv(i)}>
                <span className="tbox__n">{tool.ordinal}</span>
                <T as="h3" className="tbox__t" html={rt(tool.title)} />
                <T as="p" className="tbox__c" html={rt(tool.body)} />
                <div className="tbox__foot">
                  <span className="rb-btn rb-btn--light">{tool.linkLabel}
                    <Arrow />
                  </span>
                </div>
              </a>
            ) : (
              <div className="tbox tbox--locked" data-reveal="" style={iv(i)} key={i}>
                <span className="tbox__n">{tool.ordinal}</span>
                <div className="tbox__foot">
                  <span className="tbox__lock">
                    <svg className="tbox__lockicon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.6" width="14" height="10.4" rx="1" /><path d="M8.2 10.6V7.4a3.8 3.8 0 0 1 7.6 0v3.2" /></svg>
                    <span>{t.lockedLabel}</span>
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  )
}

/* ================= 07 - CONTRIBUTE / CONTACT ================= */
function EmailBar({ source, placeholder, button, ok, reveal }: { source: string; placeholder: string; button: string; ok: string; reveal: number }) {
  return (
    <form className="form-row" data-validate="" data-source={source} data-ok={ok} noValidate data-reveal="" style={iv(reveal)}>
      <input className="ctrl" type="email" name="email" autoComplete="email" placeholder={placeholder} spellCheck={false} required />
      <Honeypot />
      <button className="rb-btn" type="submit">{button} <Arrow /></button>
    </form>
  )
}

function Exchange({ c }: { c: SiteContent }) {
  const cols = [
    ['contribute', c.exchange.contribute],
    ['contact', c.exchange.contact],
  ] as const
  return (
    <section className="section section--parch" id="exchange">
      <div className="container">
        <div className="xch">
          {cols.map(([source, col]) => (
            <div className="xch__col" key={source}>
              <T as="p" className="eyebrow eyebrow--red" data-reveal="" html={rt(col.eyebrow)} />
              <T as="h2" className="h-2" data-reveal="" style={iv(1)} html={rt(col.heading)} />
              <T as="p" className="lede" data-reveal="" style={iv(2)} html={rt(col.standfirst)} />
              <T as="p" className="body" data-reveal="" style={iv(3, { marginTop: 22 })} html={rt(col.instruction)} />
              <EmailBar source={source} placeholder={col.placeholder} button={col.buttonLabel} ok={col.successMessage} reveal={4} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================= 08 - NEWSHUB ================= */
function Newshub({ c }: { c: SiteContent }) {
  const n = c.newshub
  return (
    <section className="section" id="newsletter">
      <div className="container">
        <div className="grid g-12 nl">
          <div className="span-6 nl__l">
            <T as="p" className="eyebrow eyebrow--red" data-reveal="" html={rt(n.eyebrow)} />
            <T as="h2" className="h-2" data-reveal="" style={iv(1)} html={rt(n.headline)} />
            <EmailBar source="newshub" placeholder={n.placeholder} button={n.buttonLabel} ok={n.successMessage} reveal={3} />
          </div>
          <div className="span-6 pl-col">
            <div className="grid g-2" style={{ gap: 24 }}>
              {n.tiles.map((tile, i) => (
                <div data-reveal="" style={iv(i)} key={i}>
                  <div className="media media--1x1"><img src={mediaUrl(tile.image)} alt="" /></div>
                  <T as="p" className="tracked" style={{ margin: '16px 0 6px' }} html={rt(tile.label, { mobileBreaks: true })} />
                  <T as="p" className="small" html={rt(tile.body)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {n.journal.length > 0 && (
          <div className="journal" data-reveal="">
            {n.journal.map((j, i) => (
              <a key={i} className="jrow" {...linkProps(j.href)}>
                <span className="jrow__d">{j.date}</span>
                <T className="jrow__t" html={rt(j.title)} />
                <span className="jrow__k">{j.kind}</span>
                <span className="jrow__a"><Arrow /></span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ================= FOOTER ================= */
function Footer({ c }: { c: SiteContent }) {
  const f = c.footer
  const last = f.groups.length - 1
  return (
    <footer className="wf-footer">
      <div className="container">
        <div className="grid g-12" style={{ gap: '40px 20px' }}>
          <div className="span-4">
            <img className="wf-footer__mark" src={f.mark ? mediaUrl(f.mark) : asset('/assets/img/footer-mark.png')} alt="RedBook Intelligence" />
            <T as="p" className="small" style={{ color: 'var(--onDark-45)' }} html={rt(f.tagline)} />
          </div>
          {f.groups.map((g, gi) => (
            <div className="span-4" key={gi}>
              <T as="p" className="tracked" style={{ marginBottom: 14 }} html={rt(g.title)} />
              <p className="small" style={{ color: 'var(--onDark-70)' }}>
                {g.links.map((l, i) => (
                  <span key={i}>
                    {i > 0 && ' · '}
                    {l.href ? (
                      <a {...linkProps(l.href)} style={{ color: 'inherit', textDecoration: 'none' }}>{l.label}</a>
                    ) : (
                      l.label
                    )}
                  </span>
                ))}
              </p>
              {gi === last && f.legal && (
                <T as="p" className="small" style={{ marginTop: 20, color: 'var(--onDark-45)' }} html={rt(f.legal)} />
              )}
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

/* ================= MOBILE MENU ================= */
function MobileMenu({ c }: { c: SiteContent }) {
  const links = [...c.header.left, ...c.header.right]
  return (
    <div className="mnav" id="mobileMenu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
      <div className="mnav__panel">
        <button className="mnav__x" type="button" id="menuClose" aria-label="Close menu"><Close /></button>
        <nav className="mnav__links" aria-label="Site">
          {links.map((l, i) => (
            <a key={i} {...linkProps(l.href)} className={'active' in l && l.active ? 'is-active' : undefined}>{l.label}</a>
          ))}
        </nav>
      </div>
    </div>
  )
}

/* ================= MODAL - REQUEST FULL INDEX ================= */
function RequestDialog({ c }: { c: SiteContent }) {
  const r = c.request
  return (
    <div className="dlg" id="reqDlg" role="dialog" aria-modal="true" aria-labelledby="reqDlgT" hidden>
      <div className="dlg__panel">
        <button className="dlg__x" type="button" id="reqDlgX" aria-label="Close"><Close /></button>
        <h3 className="dlg__t" id="reqDlgT">{r.title}</h3>
        <T as="p" className="dlg__s" html={rt(r.standfirst)} />
        <form id="reqForm" data-validate="" data-source="request_index" data-ok={r.successMessage} data-errsummary="reqErr" noValidate>
          <Honeypot />
          <div className="form-row"><input className="ctrl" type="text" name="first" autoComplete="given-name" placeholder={r.firstName} required /></div>
          <div className="form-row"><input className="ctrl" type="text" name="last" autoComplete="family-name" placeholder={r.lastName} /></div>
          <div className="form-row"><input className="ctrl" type="text" name="company" autoComplete="organization" placeholder={r.company} /></div>
          <div className="form-row"><input className="ctrl" type="text" name="position" autoComplete="organization-title" placeholder={r.position} /></div>
          <div className="form-row"><input className="ctrl" type="email" name="email" autoComplete="email" placeholder={r.email} /></div>
          <p className="dlg__err" id="reqErr" role="alert" hidden />
          <div className="dlg__foot">
            <button className="rb-btn" type="submit">{r.submitLabel} <Arrow /></button>
          </div>
        </form>
      </div>
    </div>
  )
}
