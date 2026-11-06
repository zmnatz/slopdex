import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import { createLink } from "@tanstack/react-router";

// MUI's polymorphic `component` prop and TanStack Router's route-aware `Link`
// typing don't compose cleanly through generic inference (params ends up
// resolved against the wrong overload). createLink() is Router's own
// adapter for wrapping an arbitrary component as a typed Link.
export const LinkedListItemButton = createLink(ListItemButton);
export const LinkedButtonBase = createLink(ButtonBase);
export const LinkedIconButton = createLink(IconButton);
