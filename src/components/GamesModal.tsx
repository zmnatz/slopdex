import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { gameNames } from "../utils/pokemon";
import type { GameIndex } from "../utils/types";

interface GamesModalProps {
  gameIndices: GameIndex[];
  onClose: () => void;
}

export function GamesModal({ gameIndices, onClose }: GamesModalProps) {
  const names = gameNames(gameIndices);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Games
        <IconButton aria-label="Close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <List dense disablePadding>
          {names.map((name) => (
            <ListItem key={name} className="game-item" disableGutters>
              <ListItemText
                primary={name.replace(/-/g, " ")}
                slotProps={{ primary: { sx: { textTransform: "capitalize" } } }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
