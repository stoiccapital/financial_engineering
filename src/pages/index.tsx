export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Welcome to Financial Tracker</h1>
      <p className="mt-4 text-gray-600">
        Your comprehensive solution for managing personal finances, tracking net worth, and planning your budget.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Net Worth Tracking</h2>
          <p className="text-gray-600">Monitor your assets and liabilities to track your financial progress.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Income & Expenses</h2>
          <p className="text-gray-600">Track your cash flow and analyze your spending patterns.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Budget Planning</h2>
          <p className="text-gray-600">Create and manage budgets to achieve your financial goals.</p>
        </div>
      </div>
    </div>
  );
} 