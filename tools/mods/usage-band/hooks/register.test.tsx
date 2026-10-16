import { test, expect } from 'claude-code/testing'

import { bar, compact, mood, tone } from './register'

const BAND = {
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 12,
    bodyColumns: 100,
    scroll: { offset: 0, bodyRows: 12 },
    view: {},
  },
} as const

test('bars, tones, moods and compact counts', async () => {
  expect(bar(0)).toBe('▱▱▱▱▱▱▱▱▱▱▱▱▱▱ ┆ ▱▱▱▱ ┆ ▱▱')
  expect(bar(100)).toBe('▰▰▰▰▰▰▰▰▰▰▰▰▰▰ ┆ ▰▰▰▰ ┆ ▰▰')
  expect(bar(25)).toBe('▰▰▰▰▰▱▱▱▱▱▱▱▱▱ ┆ ▱▱▱▱ ┆ ▱▱')
  expect(tone(8)).toBe('success')
  expect(tone(75)).toBe('warning')
  expect(tone(95)).toBe('error')
  expect(mood(8).label).toBe('ごきげん')
  expect(mood(95).label).toBe('ひやひや')
  expect(compact(255_000)).toBe('255k')
  expect(compact(1_000_000)).toBe('1.0M')
})

test('draws the band from a measurement on terminal and desktop', async ($, on) => {
  on('session.measure', (_$, e) => ({ changed: e.changed }))
  await $.session.measure({
    context: { tokens: 255_000, window: 1_000_000, percent: 25 },
    rateLimits: [
      { kind: 'seven_day', percentUsed: 18 },
      { kind: 'five_hour', percentUsed: 8 },
    ],
    cost: { usd: 9.42 },
    changed: ['context', 'rateLimits', 'cost'],
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'usage-band', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: /ごきげん/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /\$9\.42/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /5時間/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /7日間/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /255k\/1\.0M/ })).toBeDefined()
    await ui.unmount()
  }
})

test('yields the band while a survey holds it', async ($, on) => {
  on('session.measure', (_$, e) => ({ changed: e.changed }))
  // The engine's own drawing beneath: a marker Text so the test can tell the plugin passed.
  on('ui.render', { component: 'AbovePrompt' }, (eng, e) => {
    const { Text } = eng.ui.resolve(e)
    return <Text key="engine-own">engine-own</Text>
  })
  await $.session.measure({
    context: { tokens: 1000, window: 1_000_000, percent: 0 },
    rateLimits: [],
    cost: { usd: 0.01 },
    changed: ['context'],
  })
  const ui = await $.ui.mount({
    plugin: 'usage-band',
    surface: 'terminal',
    ...BAND,
    props: { ...BAND.props, hasSurvey: true },
  })
  expect(await ui.find({ type: 'Text', text: /セッション/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /engine-own/ })).toBeDefined()
  await ui.unmount()
})
