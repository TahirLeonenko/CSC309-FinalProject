import logo from './logo.svg'
import './App.css'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import { createTheme, Grid, MantineProvider } from '@mantine/core'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './pages/auth'
import Regular from './pages/regular/Regular'
import Transaction from './pages/regular/Transaction'
import Dashboard from './pages/general/Dashboard'
import Manager from './pages/manager/Manager'
import ManagerUser from './pages/manager/user'
import UpdateUserPage from './pages/manager/updateUser'
import ManagerTransaction from './pages/manager/transactions'
import AdjustTransactionPage from './pages/manager/adjustTransaction'
import Promotions from './pages/regular/Promotions'
import Events from './pages/regular/Events'
import ProtectRoute from './pages/auth/ProtectRoute'
import CreateEventPage from './pages/manager/createEvent'
import ManagerEventPage from './pages/manager/events'
import EditEventPage from './pages/manager/editEvent'
import ManagerPromotionPage from './pages/manager/promotions'
import CreatePromotionPage from './pages/manager/createPromotion'
import EditPromotion from './pages/manager/editPromotion'
import Cashier from './pages/cashier/Cashier'
import CashierUser from './pages/cashier/user'
import CashierTransaction from './pages/cashier/transactions/transactions'
import EventDashboard from './pages/event/Event'
import EventDashboardContent from './pages/event/eventDashboard'
import EventManager from './pages/event/eventManager'
import EventUserManagement from './pages/event/eventUserManagement'
import EventTransactions from './pages/event/eventTransactions'

const theme = createTheme({
  fontFamily:
    '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
  defaultRadius: 'md',
})

const client = new QueryClient()

function App() {
  return (
    <MantineProvider theme={theme}>
      <QueryClientProvider client={client}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />}>
              <Route path="regular" element={<ProtectRoute role={'regular'} />}>
                <Route index element={<Regular />} />
                <Route path="transaction" element={<Transaction />} />
                <Route path="promotions" element={<Promotions />} />
                <Route path="events" element={<Events />} />
              </Route>

              <Route path="manager" element={<ProtectRoute role={'manager'} />}>
                <Route index element={<Manager />} />
                <Route path="user" element={<ManagerUser />} />
                <Route path="transactions" element={<ManagerTransaction />} />
                <Route path="user/update/:userId" element={<UpdateUserPage />} />
                <Route
                  path="transactions/adjust/:transactionId"
                  element={<AdjustTransactionPage />}
                />
                <Route path="events" element={<ManagerEventPage />} />
                <Route path="events/create" element={<CreateEventPage />} />
                <Route path="events/edit/:eventId" element={<EditEventPage />} />
                <Route path="promotions" element={<ManagerPromotionPage />} />
                <Route path="promotions/create" element={<CreatePromotionPage />} />
                <Route path="promotions/edit/:promotionId" element={<EditPromotion />} />
              </Route>
              <Route path="cashier" element={<ProtectRoute role={'cashier'} />}>
                <Route index element={<Cashier />} />
                <Route path="user" element={<CashierUser />} />
                <Route path="user/:id" element={<CashierUser />} />
                <Route path="transactions" element={<CashierTransaction />} />
              </Route>
            </Route>
            <Route path="event-organizer" element={<ProtectRoute role={'regular'} />}>
              <Route element={<EventDashboard />}>
                <Route index element={<EventDashboardContent />} />
                <Route path="events" element={<EventManager />} />
                <Route path="events/:id" element={<EventManager />} />
                <Route path="user-management" element={<EventUserManagement />} />
                <Route path="user-management/:id" element={<EventUserManagement />} />
                <Route path="transactions" element={<EventTransactions />} />
                <Route path="transactions/:id" element={<EventTransactions />} />
              </Route>
            </Route>
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  )
}

export default App
