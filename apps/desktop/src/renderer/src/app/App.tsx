import { startTransition, useEffect, useState } from 'react'

import type { DesktopState } from '@mango/contracts'

import { TaskWorkbench } from '../features/task-workbench/TaskWorkbench'
import { getDesktopApi } from '../lib/desktopApi'

const resolvePreferredAdapterId = (state: DesktopState): string => {
  const selectedWorkspace =
    state.workspaces.find((workspace) => workspace.id === state.selectedWorkspaceId) ??
    state.workspaces[0]
  const preferredAdapterId = selectedWorkspace?.providerConfig?.primaryAdapterId
  const preferredAdapter = state.adapters.find(
    (adapter) => adapter.id === preferredAdapterId && adapter.available
  )

  return (
    preferredAdapter?.id ??
    state.adapters.find((adapter) => adapter.available)?.id ??
    preferredAdapterId ??
    state.adapters[0]?.id ??
    'mock-claude'
  )
}

export const App = () => {
  const [state, setState] = useState<DesktopState | null>(null)
  const [prompt, setPrompt] = useState(
    'Plan the next Mango milestone, request visible approvals, then execute the approved batch and summarize the output.'
  )
  const [busy, setBusy] = useState(false)
  const [selectedAdapterId, setSelectedAdapterId] = useState('mock-claude')

  useEffect(() => {
    let mounted = true

    void getDesktopApi()
      .bootstrap()
      .then((nextState) => {
        if (mounted) {
          startTransition(() => {
            setState(nextState)
            setSelectedAdapterId(resolvePreferredAdapterId(nextState))
          })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!state) {
      return
    }

    setSelectedAdapterId((current) =>
      state.adapters.some((adapter) => adapter.id === current && adapter.available)
        ? current
        : resolvePreferredAdapterId(state)
    )
  }, [state])

  const handlePlan = async () => {
    if (!state) {
      return
    }

    setBusy(true)

    try {
      const nextState = await getDesktopApi().generatePlan({
        prompt,
        workspaceId: state.selectedWorkspaceId,
        adapterId: selectedAdapterId || resolvePreferredAdapterId(state)
      })

      startTransition(() => {
        setState(nextState)
        setSelectedAdapterId(resolvePreferredAdapterId(nextState))
      })
    } finally {
      setBusy(false)
    }
  }

  const handleApproveAndRun = async () => {
    setBusy(true)

    try {
      const nextState = await getDesktopApi().approveAndRun()

      startTransition(() => {
        setState(nextState)
      })
    } finally {
      setBusy(false)
    }
  }

  if (!state) {
    return <div className="loading-screen">Starting Mango...</div>
  }

  return (
    <TaskWorkbench
      busy={busy}
      onAdapterChange={setSelectedAdapterId}
      onApproveAndRun={handleApproveAndRun}
      onFeedback={() => void getDesktopApi().openFeedback()}
      onGeneratePlan={handlePlan}
      onPromptChange={setPrompt}
      prompt={prompt}
      selectedAdapterId={selectedAdapterId}
      state={state}
    />
  )
}

export default App
