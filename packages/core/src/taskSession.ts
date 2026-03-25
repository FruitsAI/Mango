import type {
  ExecutionEvent,
  TaskReview,
  TaskSession,
  TaskTransition,
  WorkspaceContext
} from './types'

interface CreateTaskSessionInput {
  adapterId: string
  prompt: string
  workspace: WorkspaceContext
}

const createId = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 10)}`

const now = (): string => new Date().toISOString()

export const createTaskSession = ({
  adapterId,
  prompt,
  workspace
}: CreateTaskSessionInput): TaskSession => ({
  id: createId('task'),
  adapterId,
  prompt,
  status: 'draft',
  workspace,
  events: [],
  createdAt: now(),
  updatedAt: now()
})

const updateSession = (session: TaskSession, updates: Partial<TaskSession>): TaskSession => ({
  ...session,
  ...updates,
  updatedAt: now()
})

export const applyTaskTransition = (
  session: TaskSession,
  transition: TaskTransition
): TaskSession => {
  switch (transition.type) {
    case 'plan-generated': {
      if (session.status !== 'draft') {
        throw new Error(`Cannot move task from ${session.status} to planned`)
      }

      return updateSession(session, {
        status: 'planned',
        plan: transition.plan
      })
    }

    case 'approved': {
      if (session.status !== 'planned') {
        throw new Error(`Cannot move task from ${session.status} to approved`)
      }

      return updateSession(session, {
        status: 'approved',
        approvedBy: transition.approvedBy
      })
    }

    case 'execution-started': {
      if (session.status !== 'approved') {
        throw new Error(`Cannot move task from ${session.status} to running`)
      }

      return updateSession(session, {
        status: 'running'
      })
    }

    case 'execution-finished': {
      if (session.status !== 'running') {
        throw new Error(`Cannot move task from ${session.status} to succeeded`)
      }

      return updateSession(session, {
        status: 'succeeded',
        executionSummary: transition.summary
      })
    }

    case 'execution-failed': {
      if (session.status !== 'running') {
        throw new Error(`Cannot move task from ${session.status} to failed`)
      }

      return updateSession(session, {
        status: 'failed',
        executionSummary: transition.summary
      })
    }

    case 'cancelled': {
      if (!['planned', 'approved', 'running'].includes(session.status)) {
        throw new Error(`Cannot move task from ${session.status} to cancelled`)
      }

      const cancelledUpdates: Partial<TaskSession> = {
        status: 'cancelled'
      }

      if (transition.summary !== undefined) {
        cancelledUpdates.executionSummary = transition.summary
      }

      return updateSession(session, {
        ...cancelledUpdates
      })
    }
  }
}

export const appendExecutionEvent = (session: TaskSession, event: ExecutionEvent): TaskSession =>
  updateSession(session, {
    events: [...session.events, event]
  })

export const buildTaskReview = (session: TaskSession): TaskReview => {
  const changedFiles = Array.from(
    new Set(
      session.events
        .filter(
          (event): event is Extract<ExecutionEvent, { type: 'file.change' }> =>
            event.type === 'file.change'
        )
        .map((event) => event.filePath)
    )
  )

  const eventSummary = session.events.find(
    (event): event is Extract<ExecutionEvent, { type: 'summary.ready' }> =>
      event.type === 'summary.ready'
  )

  return {
    summary: session.executionSummary ?? eventSummary?.summary ?? 'No review summary yet.',
    changedFiles,
    totalEvents: session.events.length
  }
}
