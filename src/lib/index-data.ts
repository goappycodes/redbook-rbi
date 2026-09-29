import Ajv2020 from 'ajv/dist/2020'
import schema from './content/index-schema.json'
import fallback from './content/index-default.json'

/* The Data section's payload. See 02-index-data.md: validate every upload
   before it is written, because a malformed file does not fail loudly - it
   renders an empty chart. */

export type RegionReading = { a: (number | null)[]; v?: number; y?: number; b?: number }
export type Series = { label: string; note?: string; [region: string]: RegionReading | string | undefined }
export type IndexPayload = {
  meta: {
    year: string
    base_year?: string
    readings: string[]
    axis: { foot: number; head: number }
    regions: { key: string; label: string }[]
    locked: string
    max_selected: number
  }
  order: string[]
  series: Record<string, Series>
}

export const DEFAULT_INDEX = fallback as unknown as IndexPayload

const ajv = new Ajv2020({ allErrors: true, strict: false })
const validateSchema = ajv.compile(schema)

export type ValidationResult = { ok: boolean; errors: string[]; warnings: string[] }

export function validateIndex(input: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!validateSchema(input)) {
    for (const e of validateSchema.errors ?? []) {
      errors.push(`${e.instancePath || '(root)'} ${e.message}`)
    }
    return { ok: false, errors, warnings }
  }

  const p = input as IndexPayload
  const n = p.meta.readings.length
  const regionKeys = p.meta.regions.map((r) => r.key)
  const seriesKeys = Object.keys(p.series)

  if (new Set(regionKeys).size !== regionKeys.length) errors.push('meta.regions: the two region keys must differ')
  if (!p.series[p.meta.locked]) errors.push(`meta.locked: "${p.meta.locked}" is not a key in series`)
  if (p.order[0] !== p.meta.locked) errors.push(`order: must start with the locked series "${p.meta.locked}"`)
  for (const k of p.order) if (!p.series[k]) errors.push(`order: "${k}" is not a key in series`)
  for (const k of seriesKeys) if (!p.order.includes(k)) errors.push(`order: series "${k}" is missing from order`)
  if (new Set(p.order).size !== p.order.length) errors.push('order: contains duplicates')
  if (p.meta.axis.head <= p.meta.axis.foot) errors.push('meta.axis: head must be greater than foot')

  let max = -Infinity
  let min = Infinity
  let blanks = 0
  const unfilled: string[] = []
  const noLatest: string[] = []
  for (const key of seriesKeys) {
    for (const region of regionKeys) {
      const r = p.series[key][region] as RegionReading | undefined
      const where = `series.${key}.${region}`
      if (!r || typeof r !== 'object' || !Array.isArray(r.a)) {
        errors.push(`${where}: missing - every series needs an \`a\` array for every region`)
        continue
      }
      if (r.a.length !== n) errors.push(`${where}.a: has ${r.a.length} values, meta.readings has ${n}`)
      r.a.forEach((v) => {
        if (v === null) blanks++
        else {
          max = Math.max(max, v)
          min = Math.min(min, v)
        }
      })
      if (r.a.every((v) => v === null)) unfilled.push(where)
      else if (r.a[r.a.length - 1] === null && r.v === undefined) noLatest.push(where)
    }
  }
  /* an unfilled template is valid JSON but would publish an empty chart */
  if (unfilled.length) {
    errors.push(`${unfilled.length} series have no readings at all - fill in their \`a\` arrays: ${unfilled.slice(0, 4).join(', ')}${unfilled.length > 4 ? ', …' : ''}`)
  }
  if (noLatest.length) {
    warnings.push(`${noLatest.length} series have no latest reading, so their headline figure will show as —: ${noLatest.slice(0, 4).join(', ')}${noLatest.length > 4 ? ', …' : ''}`)
  }
  if (blanks && !unfilled.length) warnings.push(`${blanks} reading${blanks === 1 ? ' is' : 's are'} empty (null). Lines will break at those points.`)
  if (max > p.meta.axis.head) errors.push(`meta.axis.head is ${p.meta.axis.head} but the largest reading is ${max} - that line would be clipped. Raise head.`)
  if (min < p.meta.axis.foot) warnings.push(`The smallest reading (${min}) is below meta.axis.foot (${p.meta.axis.foot}) and will run off the bottom of the chart.`)
  if (p.meta.year !== p.meta.readings[n - 1]) warnings.push(`meta.year (${p.meta.year}) is not the last reading (${p.meta.readings[n - 1]}).`)

  return { ok: errors.length === 0, errors, warnings }
}

/* ---------- CSV ----------------------------------------------------------
   index_key,index_label,region,<reading>,<reading>,...  (the template's shape).
   Anything the CSV cannot carry - notes, region labels, axis - is taken from
   `base`, normally the published payload or the template. */

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some((x) => x.trim() !== '')) rows.push(row)
      row = []
    } else cell += c
  }
  row.push(cell)
  if (row.some((x) => x.trim() !== '')) rows.push(row)
  return rows
}

export function csvToIndex(text: string, base: IndexPayload): { payload?: IndexPayload; errors: string[] } {
  const rows = parseCsv(text.replace(/^﻿/, ''))
  const errors: string[] = []
  if (rows.length < 2) return { errors: ['The CSV has no data rows.'] }
  const head = rows[0].map((h) => h.trim())
  const [k, l, r] = head
  if (k !== 'index_key' || l !== 'index_label' || r !== 'region') {
    return { errors: ['The first three columns must be index_key, index_label, region (as in the template).'] }
  }
  const readings = head.slice(3).filter(Boolean)
  if (readings.length < 2) return { errors: ['At least two reading columns are needed after region.'] }

  const series: Record<string, Series> = {}
  const order: string[] = []
  const regions: string[] = []
  let max = -Infinity
  rows.slice(1).forEach((cells, i) => {
    const key = (cells[0] || '').trim()
    const label = (cells[1] || '').trim()
    const region = (cells[2] || '').trim().toLowerCase()
    if (!key || !region) { errors.push(`Row ${i + 2}: index_key and region are required.`); return }
    if (!series[key]) {
      const prev = base.series[key]
      series[key] = { label: label || prev?.label || key, ...(prev?.note ? { note: prev.note } : {}) }
      order.push(key)
    }
    if (!regions.includes(region)) regions.push(region)
    const a = readings.map((_, j) => {
      const raw = (cells[3 + j] || '').trim()
      if (raw === '') return null
      const v = Number(raw)
      if (!Number.isFinite(v)) { errors.push(`Row ${i + 2}: "${raw}" is not a number.`); return null }
      max = Math.max(max, v)
      return v
    })
    series[key][region] = { a }
  })
  if (errors.length) return { errors }

  const locked = series[base.meta.locked] ? base.meta.locked : order[0]
  const labelOf = (key: string) =>
    base.meta.regions.find((x) => x.key === key)?.label ?? key.charAt(0).toUpperCase() + key.slice(1)
  const head100 = Math.max(base.meta.axis.head, Math.ceil(max / 10) * 10)

  return {
    errors: [],
    payload: {
      meta: {
        year: readings[readings.length - 1],
        base_year: readings[0],
        readings,
        axis: { foot: base.meta.axis.foot, head: head100 },
        regions: regions.slice(0, 2).map((key) => ({ key, label: labelOf(key) })),
        locked,
        max_selected: base.meta.max_selected,
      },
      order: [locked, ...order.filter((x) => x !== locked)],
      series,
    },
  }
}

/** "2025/26" -> "From ’25", the heading of the last-segment column. */
export function sinceLabel(readings: string[]): string {
  const prev = readings[readings.length - 2] || ''
  const yy = prev.match(/^\d{2}(\d{2})/)
  return yy ? `From ’${yy[1]}` : `From ${prev}`
}
