export type RateLimitFigure = { kind: string; percentUsed: number }

export type Figures = {
  contextTokens: number | null
  contextWindow: number
  contextPercent: number | null
  rateLimits: RateLimitFigure[]
  usd: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'usage-band': { figures: Figures | null; isHidden: boolean }
  }
}
