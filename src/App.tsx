import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './theme'
import { router } from './router'
import { FiltersProvider } from './hooks/FiltersContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, retry: 3 },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <FiltersProvider>
          <RouterProvider router={router} />
        </FiltersProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
