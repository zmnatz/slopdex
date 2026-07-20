import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import CloseIcon from '@mui/icons-material/Close'
import type { PokemonMove } from '../utils/types'
import { uniqueMoveNames } from '../utils/pokemon'

interface MovesModalProps {
  moves: PokemonMove[]
  onClose: () => void
}

export function MovesModal({ moves, onClose }: MovesModalProps) {
  const names = uniqueMoveNames(moves)

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Moves
        <IconButton aria-label="Close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <List dense disablePadding>
          {names.map(name => (
            <ListItem key={name} className="move-item" disableGutters>
              <ListItemText primary={name.replace(/-/g, ' ')} slotProps={{ primary: { sx: { textTransform: 'capitalize' } } }} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  )
}
