import { useState, useEffect, useCallback, useRef } from 'react'
import { useSIWS } from '../lib/useSIWS'
import { 
  oracleReferendumService, 
  ServiceOraclePoll, 
  VoteRequest, 
  VoteResponse,
  GeneratePollRequest,
  CreatePollRequest,
  PollUpdateCallback,
  VoteUpdateCallback,
  CommentaryUpdateCallback
} from '../services/oracleReferendumService'

interface UseOracleReferendumState {
  polls: ServiceOraclePoll[]
  currentPoll: ServiceOraclePoll | null
  loading: boolean
  error: string | null
  voting: boolean
  generating: boolean
  liveCommentary: Map<string, string>
}

interface UseOracleReferendumActions {
  loadPolls: () => Promise<void>
  loadPoll: (pollId: string) => Promise<void>
  checkCooldownStatus: (pollId: string) => Promise<void>
  vote: (pollId: string, optionId: string) => Promise<VoteResponse | null>
  generatePoll: (request: GeneratePollRequest) => Promise<ServiceOraclePoll | null>
  createPoll: (pollData: CreatePollRequest) => Promise<ServiceOraclePoll | null>
  updatePoll: (pollId: string, pollData: Partial<CreatePollRequest>) => Promise<ServiceOraclePoll | null>
  deletePoll: (pollId: string) => Promise<boolean>
  refreshCurrentPoll: () => Promise<void>
  clearError: () => void
  setCurrentPoll: (poll: ServiceOraclePoll | null) => void
  subscribeToPoll: (pollId: string) => void
  unsubscribeFromPoll: (pollId: string) => void
}

type UseOracleReferendumReturn = UseOracleReferendumState & UseOracleReferendumActions

export function useOracleReferendum(): UseOracleReferendumReturn {
  const { isAuthenticated, walletAddress, session } = useSIWS()
  
  const [state, setState] = useState<UseOracleReferendumState>({
    polls: [],
    currentPoll: null,
    loading: false,
    error: null,
    voting: false,
    generating: false,
    liveCommentary: new Map()
  })

  // Track active subscriptions
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map())

  // Set authentication token when user is authenticated
  useEffect(() => {
    console.log('🔮 Oracle Referendum: Auth state changed', { 
      isAuthenticated, 
      hasSession: !!session,
      sessionToken: session?.session_token ? `${session.session_token.substring(0, 20)}...` : 'none',
      walletAddress 
    })
    
    if (isAuthenticated && session?.session_token) {
      oracleReferendumService.setAuthToken(session.session_token)
      console.log('🔮 Oracle Referendum: Auth token set')
    } else {
      oracleReferendumService.clearAuthToken()
      console.log('🔮 Oracle Referendum: Auth token cleared')
    }
  }, [isAuthenticated, session, walletAddress])

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const setVoting = useCallback((voting: boolean) => {
    setState(prev => ({ ...prev, voting }))
  }, [])

  const setGenerating = useCallback((generating: boolean) => {
    setState(prev => ({ ...prev, generating }))
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  const setCurrentPoll = useCallback((poll: ServiceOraclePoll | null) => {
    setState(prev => ({ ...prev, currentPoll: poll }))
  }, [])

  // Load all polls
  const loadPolls = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Always call the backend - it will handle both authenticated and unauthenticated users
      // Authenticated users get polls with their vote data, unauthenticated users get polls without vote data
      const response = await oracleReferendumService.listPolls(walletAddress || undefined)
      setState(prev => ({ ...prev, polls: response.polls }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load polls'
      setError(errorMessage)
      console.error('Error loading polls:', error)
    } finally {
      setLoading(false)
    }
  }, [walletAddress, setLoading, setError])

  // Load specific poll with user vote info
  const loadPoll = useCallback(async (pollId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await oracleReferendumService.getPoll(pollId, walletAddress || undefined)
      setState(prev => ({ ...prev, currentPoll: response.poll }))
      
      // If user is authenticated, proactively check cooldown status
      if (isAuthenticated && walletAddress) {
        try {
          const cooldownInfo = await oracleReferendumService.checkCooldownStatus(pollId, walletAddress)
          console.log('🕐 Cooldown status for poll:', pollId, cooldownInfo)
          
          // Update the poll with cooldown information
          setState(prev => ({
            ...prev,
            currentPoll: prev.currentPoll ? {
              ...prev.currentPoll,
              cooldown_info: cooldownInfo
            } : null
          }))
        } catch (cooldownError) {
          console.warn('Failed to check cooldown status:', cooldownError)
          // Don't fail the entire poll load for cooldown check failure
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load poll'
      setError(errorMessage)
      console.error('Error loading poll:', error)
    } finally {
      setLoading(false)
    }
  }, [walletAddress, isAuthenticated, setLoading, setError])

  // Check cooldown status for a specific poll
  const checkCooldownStatus = useCallback(async (pollId: string) => {
    if (!isAuthenticated || !walletAddress) {
      return
    }

    try {
      console.log('🕐 Checking cooldown status for poll:', pollId)
      const cooldownInfo = await oracleReferendumService.checkCooldownStatus(pollId, walletAddress)
      
      // Update both current poll and polls list in a single setState
      setState(prev => {
        const updatedCurrentPoll = prev.currentPoll?.id === pollId ? {
          ...prev.currentPoll,
          cooldown_info: cooldownInfo
        } : prev.currentPoll;

        const updatedPolls = prev.polls.map(poll => 
          poll.id === pollId ? {
            ...poll,
            cooldown_info: cooldownInfo
          } : poll
        );

        return {
          ...prev,
          currentPoll: updatedCurrentPoll,
          polls: updatedPolls
        };
      });
    } catch (error) {
      console.error('Error checking cooldown status:', error)
      // Don't set global error state for cooldown check failures
    }
  }, [isAuthenticated, walletAddress])

  // Submit vote
  const vote = useCallback(async (pollId: string, optionId: string): Promise<VoteResponse | null> => {
    if (!isAuthenticated || !walletAddress) {
      setError('Please connect your wallet to vote')
      return null
    }

    setVoting(true)
    setError(null)

    try {
      const voteRequest: VoteRequest = {
        pollId,
        optionId,
        walletAddress
      }

      const response = await oracleReferendumService.vote(voteRequest)
      
      if (response.success) {
        // Update current poll if it matches
        if (response.updated_poll && state.currentPoll?.id === pollId) {
          setState(prev => ({ 
            ...prev, 
            currentPoll: response.updated_poll!, 
            voting: false 
          }))
        }

        // Update polls list
        if (response.updated_poll) {
          setState(prev => ({
            ...prev,
            polls: prev.polls.map(poll => 
              poll.id === pollId ? response.updated_poll! : poll
            ),
            voting: false
          }))
        }

        // Add live commentary if provided
        if (response.oracle_commentary) {
          setState(prev => ({
            ...prev,
            liveCommentary: new Map(prev.liveCommentary.set(
              pollId, 
              response.oracle_commentary!.commentary_text
            ))
          }))
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          voting: false, 
          error: response.error || 'Failed to submit vote' 
        }))
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cast vote'
      setError(errorMessage)
      console.error('Error voting:', error)
      return null
    } finally {
      setVoting(false)
    }
  }, [isAuthenticated, walletAddress, state.currentPoll])

  // Generate AI poll
  const generatePoll = useCallback(async (request: GeneratePollRequest): Promise<ServiceOraclePoll | null> => {
    if (!isAuthenticated || !walletAddress) {
      setError('Please connect your wallet to generate polls')
      return null
    }

    setGenerating(true)
    setError(null)

    try {
      const response = await oracleReferendumService.generatePoll(request, walletAddress)
      
      // Add new poll to the list
      setState(prev => ({ 
        ...prev, 
        polls: [response.poll, ...prev.polls] 
      }))

      return response.poll
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate poll'
      setError(errorMessage)
      console.error('Error generating poll:', error)
      return null
    } finally {
      setGenerating(false)
    }
  }, [isAuthenticated, walletAddress, setGenerating, setError])

  // Create custom poll
  const createPoll = useCallback(async (pollData: CreatePollRequest): Promise<ServiceOraclePoll | null> => {
    if (!isAuthenticated || !walletAddress) {
      setError('Please connect your wallet to create polls')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await oracleReferendumService.createPoll(pollData, walletAddress)
      
      // Add new poll to the list
      setState(prev => ({ 
        ...prev, 
        polls: [response.poll, ...prev.polls] 
      }))

      return response.poll
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create poll'
      setError(errorMessage)
      console.error('Error creating poll:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, walletAddress, setLoading, setError])

  const updatePoll = useCallback(async (pollId: string, pollData: Partial<CreatePollRequest>): Promise<ServiceOraclePoll | null> => {
    if (!isAuthenticated || !walletAddress) {
      setError('Please connect your wallet to update polls')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await oracleReferendumService.updatePoll(pollId, pollData, walletAddress)
      
      // Update poll in the list
      setState(prev => ({
        ...prev,
        polls: prev.polls.map(poll => 
          poll.id === pollId ? response.poll : poll
        ),
        currentPoll: prev.currentPoll?.id === pollId ? response.poll : prev.currentPoll
      }))

      return response.poll
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update poll'
      setError(errorMessage)
      console.error('Error updating poll:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, walletAddress, setLoading, setError])

  const deletePoll = useCallback(async (pollId: string): Promise<boolean> => {
    if (!isAuthenticated || !walletAddress) {
      setError('Please connect your wallet to delete polls')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      await oracleReferendumService.deletePoll(pollId, walletAddress)
      
      // Remove poll from the list
      setState(prev => ({
        ...prev,
        polls: prev.polls.filter(poll => poll.id !== pollId),
        currentPoll: prev.currentPoll?.id === pollId ? null : prev.currentPoll
      }))

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete poll'
      setError(errorMessage)
      console.error('Error deleting poll:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, walletAddress, setLoading, setError])

  const refreshCurrentPoll = useCallback(async () => {
    if (state.currentPoll) {
      await loadPoll(state.currentPoll.id)
    }
  }, [state.currentPoll, loadPoll])

  // Real-time subscription callbacks
  const onPollUpdate: PollUpdateCallback = useCallback((updatedPoll) => {
    setState(prev => ({
      ...prev,
      polls: prev.polls.map(poll => 
        poll.id === updatedPoll.id ? updatedPoll : poll
      ),
      currentPoll: prev.currentPoll?.id === updatedPoll.id ? updatedPoll : prev.currentPoll
    }))
  }, [])

  const onVoteUpdate: VoteUpdateCallback = useCallback((pollId, optionId, newCount) => {
    setState(prev => ({
      ...prev,
      polls: prev.polls.map(poll => 
        poll.id === pollId 
          ? {
              ...poll,
              options: poll.options.map(option =>
                option.id === optionId 
                  ? { ...option, votes_count: newCount }
                  : option
              )
            }
          : poll
      ),
      currentPoll: prev.currentPoll?.id === pollId
        ? {
            ...prev.currentPoll,
            options: prev.currentPoll.options.map(option =>
              option.id === optionId 
                ? { ...option, votes_count: newCount }
                : option
            )
          }
        : prev.currentPoll
    }))
  }, [])

  const onCommentaryUpdate: CommentaryUpdateCallback = useCallback((pollId, commentary, urgency) => {
    setState(prev => ({
      ...prev,
      liveCommentary: new Map(prev.liveCommentary.set(pollId, commentary))
    }))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }, [])

  // Subscribe to specific poll updates
  const subscribeToPoll = useCallback((pollId: string) => {
    // Unsubscribe if already subscribed
    const existingUnsub = subscriptionsRef.current.get(pollId)
    if (existingUnsub) {
      existingUnsub()
    }

    // Set up new subscriptions
    const voteUnsub = oracleReferendumService.subscribeToVoteUpdates(pollId, onVoteUpdate)
    const commentaryUnsub = oracleReferendumService.subscribeToCommentary(pollId, onCommentaryUpdate)

    // Combined unsubscribe function
    const unsubscribe = () => {
      voteUnsub()
      commentaryUnsub()
      subscriptionsRef.current.delete(pollId)
    }

    subscriptionsRef.current.set(pollId, unsubscribe)
  }, [onVoteUpdate, onCommentaryUpdate])

  // Unsubscribe from specific poll
  const unsubscribeFromPoll = useCallback((pollId: string) => {
    const unsubscribe = subscriptionsRef.current.get(pollId)
    if (unsubscribe) {
      unsubscribe()
    }
  }, [])

  // Set up global poll updates subscription on mount
  useEffect(() => {
    const unsubscribePollUpdates = oracleReferendumService.subscribeToPollUpdates(onPollUpdate)
    
    // Load initial polls
    loadPolls()

    return () => {
      unsubscribePollUpdates()
      // Clean up all poll-specific subscriptions
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe())
      subscriptionsRef.current.clear()
      oracleReferendumService.unsubscribeAll()
    }
  }, [loadPolls, onPollUpdate])

  return {
    // State
    polls: state.polls,
    currentPoll: state.currentPoll,
    loading: state.loading,
    error: state.error,
    voting: state.voting,
    generating: state.generating,
    liveCommentary: state.liveCommentary,
    
    // Actions
    loadPolls,
    loadPoll,
    vote,
    generatePoll,
    createPoll,
    updatePoll,
    deletePoll,
    refreshCurrentPoll,
    clearError,
    setCurrentPoll,
    subscribeToPoll,
    unsubscribeFromPoll,
    checkCooldownStatus
  }
}

// Helper hook for Oracle Referendum utilities
export function useOracleReferendumUtils() {
  return {
    isPollActive: oracleReferendumService.isPollActive.bind(oracleReferendumService),
    hasUserVoted: oracleReferendumService.hasUserVoted.bind(oracleReferendumService),
    getTimeRemaining: oracleReferendumService.getTimeRemaining.bind(oracleReferendumService),
    formatOraclePersonality: oracleReferendumService.formatOraclePersonality.bind(oracleReferendumService),
    getOraclePersonalityTheme: oracleReferendumService.getOraclePersonalityTheme.bind(oracleReferendumService),
    formatPollCategory: oracleReferendumService.formatPollCategory.bind(oracleReferendumService),
    getCategoryIcon: oracleReferendumService.getCategoryIcon.bind(oracleReferendumService),
    calculateVotePercentage: oracleReferendumService.calculateVotePercentage.bind(oracleReferendumService),
    getWinningOptions: oracleReferendumService.getWinningOptions.bind(oracleReferendumService)
  }
} 