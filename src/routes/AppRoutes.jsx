import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../components/layout/AdminLayout'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import Login from '../pages/auth/Login'
import Dashboard from '../pages/dashboard/Dashboard'
import InventoryList from '../pages/inventory/InventoryList'
import AddProduct from '../pages/inventory/AddProduct'
import EditProduct from '../pages/inventory/EditProduct'
import CustomerList from '../pages/customers/CustomerList'
import AddCustomer from '../pages/customers/AddCustomer'
import EditCustomer from '../pages/customers/EditCustomer'
import CustomerDetails from '../pages/customers/CustomerDetails'
import SalesList from '../pages/sales/SalesList'
import NewSale from '../pages/sales/NewSale'
import Invoice from '../pages/sales/Invoice'
import PaymentsList from '../pages/payments/PaymentsList'
import NewPayment from '../pages/payments/NewPayment'
import EditPayment from '../pages/payments/EditPayment'
import PaymentDetails from '../pages/payments/PaymentDetails'
import ExpensesList from '../pages/expenses/ExpensesList'
import NewExpense from '../pages/expenses/NewExpense'
import EditExpense from '../pages/expenses/EditExpense'
import NotFound from '../pages/NotFound'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<InventoryList />} />
          <Route path="inventory/add" element={<AddProduct />} />
          <Route path="inventory/edit/:id" element={<EditProduct />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/add" element={<AddCustomer />} />
          <Route path="customers/edit/:id" element={<EditCustomer />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="sales" element={<SalesList />} />
          <Route path="sales/new" element={<NewSale />} />
          <Route path="sales/:id" element={<Invoice />} />
          <Route path="payments" element={<PaymentsList />} />
          <Route path="payments/new" element={<NewPayment />} />
          <Route path="payments/edit/:id" element={<EditPayment />} />
          <Route path="payments/:id" element={<PaymentDetails />} />
          <Route path="expenses" element={<ExpensesList />} />
          <Route path="expenses/new" element={<NewExpense />} />
          <Route path="expenses/edit/:id" element={<EditExpense />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
