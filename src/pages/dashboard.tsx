import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { useNetworth } from '@/hooks/useNetworth'
import { useIncomeExpense } from '@/hooks/useIncomeExpense'
import Projections from '@/components/Dashboard/Projections'
import { formatNumber } from '@/utils/formatNumber'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { summary: networthSummary, loading: networthLoading, error: networthError } = useNetworth()
  const { summary: incomeExpenseSummary, loading: incomeExpenseLoading, error: incomeExpenseError } = useIncomeExpense()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Log errors and data for debugging
  useEffect(() => {
    if (networthError) {
      console.error('Networth Error:', networthError)
    }
    if (incomeExpenseError) {
      console.error('Income Expense Error:', incomeExpenseError)
    }
    if (!networthLoading && !incomeExpenseLoading) {
      console.log('Networth Summary:', networthSummary)
      console.log('Income Expense Summary:', incomeExpenseSummary)
    }
  }, [networthError, incomeExpenseError, networthLoading, incomeExpenseLoading, networthSummary, incomeExpenseSummary])

  if (authLoading || networthLoading || incomeExpenseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show error state if there are errors
  if (networthError || incomeExpenseError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h2>
          {networthError && <p className="text-red-600">{networthError}</p>}
          {incomeExpenseError && <p className="text-red-600">{incomeExpenseError}</p>}
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const metrics = [
    {
      title: 'Net Worth',
      value: formatNumber(networthSummary.netWorth),
      description: 'Total assets minus liabilities',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Total Assets',
      value: formatNumber(networthSummary.totalAssets),
      description: 'Sum of all assets',
      color: 'bg-green-50 text-green-700',
    },
    {
      title: 'Total Liabilities',
      value: formatNumber(networthSummary.totalLiabilities),
      description: 'Sum of all liabilities',
      color: 'bg-red-50 text-red-700',
    },
    {
      title: 'Average Income',
      value: formatNumber(incomeExpenseSummary.averageIncome),
      description: 'Monthly average income',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Average Expense',
      value: formatNumber(incomeExpenseSummary.averageExpense),
      description: 'Monthly average expenses',
      color: 'bg-orange-50 text-orange-700',
    },
    {
      title: 'Monthly Savings',
      value: formatNumber(incomeExpenseSummary.savings),
      description: 'Average monthly savings',
      color: 'bg-teal-50 text-teal-700',
    },
    {
      title: 'Savings Rate',
      value: formatPercentage(incomeExpenseSummary.savingsRate),
      description: 'Percentage of income saved',
      color: 'bg-indigo-50 text-indigo-700',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Financial Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-md ${metric.color}`}
          >
            <h2 className="text-lg font-semibold mb-2">{metric.title}</h2>
            <p className="text-2xl font-bold mb-2">{metric.value}</p>
            <p className="text-sm opacity-75">{metric.description}</p>
          </div>
        ))}
      </div>

      <Projections
        networth={networthSummary.netWorth}
        monthlySavings={incomeExpenseSummary.savings}
      />
    </div>
  )
} 