import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { useNetworth } from '@/hooks/useNetworth'
import { useIncomeExpense } from '@/hooks/useIncomeExpense'
import Projections from '@/components/Dashboard/Projections'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { summary: networthSummary, loading: networthLoading } = useNetworth()
  const { summary: incomeExpenseSummary, loading: incomeExpenseLoading } = useIncomeExpense()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  if (authLoading || networthLoading || incomeExpenseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
      value: formatCurrency(networthSummary.netWorth),
      description: 'Total assets minus liabilities',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Total Assets',
      value: formatCurrency(networthSummary.totalAssets),
      description: 'Sum of all assets',
      color: 'bg-green-50 text-green-700',
    },
    {
      title: 'Total Liabilities',
      value: formatCurrency(networthSummary.totalLiabilities),
      description: 'Sum of all liabilities',
      color: 'bg-red-50 text-red-700',
    },
    {
      title: 'Average Income',
      value: formatCurrency(incomeExpenseSummary.averageIncome),
      description: 'Monthly average income',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Average Expense',
      value: formatCurrency(incomeExpenseSummary.averageExpense),
      description: 'Monthly average expenses',
      color: 'bg-orange-50 text-orange-700',
    },
    {
      title: 'Monthly Savings',
      value: formatCurrency(incomeExpenseSummary.savings),
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