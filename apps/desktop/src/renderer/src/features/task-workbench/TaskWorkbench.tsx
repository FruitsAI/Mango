import type { DesktopState } from '@mango/contracts'

interface TaskWorkbenchProps {
  state: DesktopState
  prompt?: string
  busy?: boolean
  selectedAdapterId?: string
  onAdapterChange?: (value: string) => void
  onPromptChange?: (value: string) => void
  onGeneratePlan?: () => void
  onApproveAndRun?: () => void
  onFeedback?: () => void
}

const statusCopy: Record<NonNullable<DesktopState['activeTask']>['status'], string> = {
  draft: 'Waiting for a plan',
  planned: 'Plan ready for review',
  approved: 'Approved and queued',
  running: 'Executing on your behalf',
  succeeded: 'Result ready to review',
  failed: 'Execution needs attention',
  cancelled: 'Execution stopped by the user'
}

const laneLabels = ['Plan', 'Approve', 'Go', 'Review']

const formatStatus = (state: DesktopState): string =>
  state.activeTask ? statusCopy[state.activeTask.status] : 'No task yet'

const resolveSelectedAdapter = (state: DesktopState, selectedAdapterId?: string) =>
  state.adapters.find((adapter) => adapter.id === selectedAdapterId) ??
  state.adapters.find((adapter) => adapter.available) ??
  state.adapters[0]

export const TaskWorkbench = ({
  state,
  prompt = 'Ship the first Mango milestone: scaffold the desktop workspace, wire the task engine, and prepare the release pipeline.',
  busy = false,
  selectedAdapterId,
  onAdapterChange,
  onPromptChange,
  onGeneratePlan,
  onApproveAndRun,
  onFeedback
}: TaskWorkbenchProps) => {
  const selectedWorkspace =
    state.workspaces.find((workspace) => workspace.id === state.selectedWorkspaceId) ??
    state.workspaces[0]
  const selectedAdapter = resolveSelectedAdapter(
    state,
    selectedAdapterId ?? selectedWorkspace?.providerConfig?.primaryAdapterId
  )
  const activePlan = state.activeTask?.plan

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-card">
          <div className="brand-mark">M</div>
          <div>
            <p className="eyebrow">Man, Go!</p>
            <h1>{state.productName}</h1>
            <p className="muted">{state.slogan}</p>
          </div>
        </div>

        <section className="panel">
          <p className="eyebrow">Environment</p>
          <div className="metric">
            <span>Platform</span>
            <strong>{state.environment.platform}</strong>
          </div>
          <div className="metric">
            <span>Shell</span>
            <strong>{state.environment.shell}</strong>
          </div>
          <div className="metric">
            <span>Release channel</span>
            <strong>{state.settings.releaseChannel}</strong>
          </div>
        </section>

        <section className="panel">
          <p className="eyebrow">Workspaces</p>
          {state.workspaces.map((workspace) => (
            <div
              className={`workspace-card ${
                workspace.id === state.selectedWorkspaceId ? 'active' : ''
              }`}
              key={workspace.id}
            >
              <strong>{workspace.name}</strong>
              <span>{workspace.rootPath}</span>
              <span>
                {workspace.gitBranch} • {workspace.gitStatusSummary}
              </span>
            </div>
          ))}
        </section>
      </aside>

      <main className="content">
        <section className="hero">
          <div>
            <p className="eyebrow">Desktop Agent Workbench</p>
            <h2>You Plan, Mango Goes.</h2>
            <p className="lede">
              A citrus-bright control room for planning, approving, executing, and reviewing
              developer tasks without surrendering visibility.
            </p>
          </div>
          <div className="status-badge">{formatStatus(state)}</div>
        </section>

        <section className="execution-lane panel">
          <div className="lane-header">
            <p className="eyebrow">Execution loop</p>
            <span>{selectedAdapter?.label ?? 'No adapter selected'}</span>
          </div>
          <div className="lane-grid">
            {laneLabels.map((label, index) => (
              <div className="lane-pill" key={label}>
                <span>{`0${index + 1}`}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="workspace-grid">
          <article className="panel composer">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Task intake</p>
                <h3>Brief Mango on the next move</h3>
              </div>
              <button className="ghost-button" onClick={onFeedback} type="button">
                Feedback
              </button>
            </div>
            <label className="prompt-field">
              <span>Task prompt</span>
              <textarea
                onChange={(event) => onPromptChange?.(event.target.value)}
                rows={6}
                value={prompt}
              />
            </label>
            <label className="adapter-field">
              <span>Execution adapter</span>
              <select
                aria-label="Execution adapter"
                onChange={(event) => onAdapterChange?.(event.target.value)}
                value={selectedAdapter?.id ?? ''}
              >
                {state.adapters.map((adapter) => (
                  <option disabled={!adapter.available} key={adapter.id} value={adapter.id}>
                    {adapter.available ? adapter.label : `${adapter.label} (Unavailable)`}
                  </option>
                ))}
              </select>
            </label>
            <p className="adapter-details">
              {selectedAdapter?.details ?? 'Choose an adapter to generate the next plan.'}
            </p>
            <div className="metadata-strip">
              <span>{selectedWorkspace?.rootPath ?? 'No workspace selected'}</span>
              <span>{selectedAdapter?.label ?? 'No adapter selected'}</span>
            </div>
            <div className="actions">
              <button
                className="primary-button"
                disabled={busy}
                onClick={onGeneratePlan}
                type="button"
              >
                Generate plan
              </button>
              <button
                className="secondary-button"
                disabled={busy || !state.activeTask?.plan}
                onClick={onApproveAndRun}
                type="button"
              >
                Approve and run
              </button>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Plan</p>
                <h3>{activePlan?.headline ?? 'No plan generated yet'}</h3>
              </div>
              <span className="signal">{state.currentPermissions.length} approvals</span>
            </div>
            <p className="muted">
              {activePlan?.summary ?? 'Mango is ready to draft the next action plan.'}
            </p>
            <ol className="steps">
              {(activePlan?.steps ?? ['Draft the first task to see the execution rail.']).map(
                (step) => (
                  <li key={step}>{step}</li>
                )
              )}
            </ol>
            <div className="permissions">
              {state.currentPermissions.map((permission) => (
                <div
                  className="permission-chip"
                  key={`${permission.capability}-${permission.reason}`}
                >
                  <strong>{permission.capability}</strong>
                  <span>{permission.risk}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="workspace-grid">
          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Go</p>
                <h3>Execution timeline</h3>
              </div>
              <span className="signal">{state.activeTask?.events.length ?? 0} events</span>
            </div>
            <div className="timeline">
              {(state.activeTask?.events ?? []).map((event) => (
                <div className="timeline-row" key={event.id}>
                  <span className={`timeline-dot ${event.level}`}></span>
                  <div>
                    <strong>{event.message}</strong>
                    <p>{event.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Review</p>
                <h3>Outcome snapshot</h3>
              </div>
              <span className="signal">{state.history.length} tasks</span>
            </div>
            <p className="review-summary">
              {state.review?.summary ??
                'Review summary will appear after Mango finishes execution.'}
            </p>
            <div className="file-list">
              {(state.review?.changedFiles ?? []).map((filePath) => (
                <code key={filePath}>{filePath}</code>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
