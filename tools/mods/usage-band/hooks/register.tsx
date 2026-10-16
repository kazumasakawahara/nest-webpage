import { atom, read, update } from 'claude-code'
import type { Register, SessionContextUsage, SessionRateLimit, SessionCost } from 'claude-code'

import type { Figures, RateLimitFigure } from '../types'

const figures = atom({ plugin: 'usage-band', key: 'figures' } as const, null)
const isHidden = atom({ plugin: 'usage-band', key: 'isHidden' } as const, false)

// 20 segments; dividers after 14 (70%) and 18 (90%), the same marks as the colour thresholds.
const SEGMENTS = 20
const DIVIDERS = new Set([14, 18])
const FILLED = '▰'
const EMPTY = '▱'
const DIVIDER = '┆'

const LABELS: Record<string, string> = {
  five_hour: '5時間',
  seven_day: '7日間',
  spend_limit: '支出上限',
}
const ORDER = ['five_hour', 'seven_day', 'spend_limit']

const clamp = (n: number) => Math.max(0, Math.min(100, n))

export function bar(percent: number): string {
  const filled = Math.round((clamp(percent) / 100) * SEGMENTS)
  let out = ''
  for (let i = 0; i < SEGMENTS; i++) {
    if (DIVIDERS.has(i)) out += ` ${DIVIDER} `
    out += i < filled ? FILLED : EMPTY
  }
  return out
}

export function tone(percent: number): 'success' | 'warning' | 'error' {
  if (percent >= 90) return 'error'
  if (percent >= 70) return 'warning'
  return 'success'
}

export function mood(worstPercent: number): { face: string; label: string } {
  if (worstPercent >= 90) return { face: '(=ﾟДﾟ=)', label: 'ひやひや' }
  if (worstPercent >= 70) return { face: '(=;ω;=)', label: 'そわそわ' }
  if (worstPercent >= 40) return { face: '(=・ω・=)', label: 'まずまず' }
  return { face: '(=^・ω・^=)', label: 'ごきげん' }
}

export function compact(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}k`
  return String(tokens)
}

function toFigures(
  context: SessionContextUsage,
  rateLimits: readonly SessionRateLimit[],
  cost: SessionCost | undefined,
): Figures {
  const limits: RateLimitFigure[] = rateLimits
    .map(r => ({ kind: r.kind, percentUsed: r.percentUsed }))
    .sort((a, b) => {
      const ia = ORDER.indexOf(a.kind)
      const ib = ORDER.indexOf(b.kind)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
  return {
    contextTokens: context.tokens ?? null,
    contextWindow: context.window,
    contextPercent: context.percent ?? null,
    rateLimits: limits,
    usd: cost?.usd ?? null,
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    $.command.register({
      name: 'usage-band',
      description: 'Show or hide the usage band above the prompt',
    })
    try {
      const u = await $.session.usage()
      await update($, figures, () => toFigures(u.context, u.rateLimits, u.cost))
    } catch {
      // No figures yet; the first session.measure fills them in.
    }
    return next(e)
  })

  on('command.run', { command: 'usage-band' }, async ($, e, next) => {
    const hidden = await update($, isHidden, v => !v)
    return { text: hidden ? 'usage-band: hidden' : 'usage-band: shown' }
  }).catch(($, e, next) =>
    next.called ? next(e) : { text: 'usage-band: could not toggle the band.' },
  )

  on('session.measure', async ($, e, next) => {
    await update($, figures, () => toFigures(e.context, e.rateLimits, e.cost))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const f = await read($, figures)
    if (e.props.hasSurvey || f === null || (await read($, isHidden))) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    const worst = Math.max(0, ...f.rateLimits.map(r => r.percentUsed), f.contextPercent ?? 0)
    const m = mood(worst)
    const cost = f.usd === null ? '' : `💰$${f.usd.toFixed(2)}`
    const ctxPct = f.contextPercent ?? 0
    const ctxLabel =
      f.contextTokens === null ? '' : `${compact(f.contextTokens)}/${compact(f.contextWindow)}`

    return (
      <Box flexDirection="column">
        <Box gap={1}>
          <Text color={tone(worst)} bold>
            {m.face} {m.label}
          </Text>
          <Text dimColor>{cost}</Text>
        </Box>
        {f.rateLimits.map(r => (
          <Box key={r.kind} gap={1}>
            <Text>🌍 {LABELS[r.kind] ?? r.kind}</Text>
            <Text color={tone(r.percentUsed)}>{bar(r.percentUsed)}</Text>
            <Text color={tone(r.percentUsed)} bold>
              {Math.round(r.percentUsed)}%
            </Text>
            <Text>✨</Text>
          </Box>
        ))}
        <Box gap={1}>
          <Text>🍙 セッション</Text>
          <Text color={tone(ctxPct)}>{bar(ctxPct)}</Text>
          <Text color={tone(ctxPct)} bold>
            {Math.round(ctxPct)}%
          </Text>
          <Text dimColor>{ctxLabel}</Text>
          <Text>✨</Text>
        </Box>
      </Box>
    )
  })
}
