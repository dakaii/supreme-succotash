'use client'

import {getTokenLotteryProgram, getTokenLotteryProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useTokenLotteryProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getTokenLotteryProgramId(cluster.network as Cluster), [cluster])
  const program = getTokenLotteryProgram(provider)

  const accounts = useQuery({
    queryKey: ['token_lottery', 'all', { cluster }],
    queryFn: () => program.account.token_lottery.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['token_lottery', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ token_lottery: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useTokenLotteryProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useTokenLotteryProgram()

  const accountQuery = useQuery({
    queryKey: ['token_lottery', 'fetch', { cluster, account }],
    queryFn: () => program.account.token_lottery.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['token_lottery', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ token_lottery: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['token_lottery', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ token_lottery: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['token_lottery', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ token_lottery: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['token_lottery', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ token_lottery: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
