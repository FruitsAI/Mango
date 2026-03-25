export * from './claudeCodeCliAdapter'
export * from './mockClaudeCodeAdapter'

import type { AgentAdapter } from '@mango/core'

import { ClaudeCodeCliAdapter } from './claudeCodeCliAdapter'
import { MockClaudeCodeAdapter } from './mockClaudeCodeAdapter'

export const createDefaultAgentAdapters = (): AgentAdapter[] => [
  new ClaudeCodeCliAdapter(),
  new MockClaudeCodeAdapter()
]
