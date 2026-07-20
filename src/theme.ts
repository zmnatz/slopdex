import { createTheme } from '@mui/material/styles'

export const DRAWER_WIDTH = 380

export const theme = createTheme({
  palette: {
    primary: {
      main: '#dc0a2d',
      dark: '#8b0000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2ca0dc',
      contrastText: '#ffffff',
    },
    background: {
      default: '#eef2f3',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
})
