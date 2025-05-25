import { EllipsisIcon, FilePenLineIcon, TrashIcon } from "@yamada-ui/lucide";
import { IconButton, Menu, MenuButton, MenuItem, MenuList, useDisclosure } from "@yamada-ui/react";
import { memo, useCallback } from "react";
import { deleteExcludedApp } from "~/utils/excluded-apps";
import { EditExcludedAppModal } from "./edit-excluded-app-modal";

interface ControlMenuProps {
  rowId: string;
}

export const ControlMenu = memo(
  ({ rowId }: ControlMenuProps) => {
    const { open: isEditModalOpen, onOpen: openEditModal, onClose: closeEditModal } = useDisclosure();

    const handleDelete = useCallback(async () => {
      try {
        await deleteExcludedApp(rowId);
      } catch (error) {
        console.error("Failed to delete excluded app:", error);
      }
    }, [rowId]);

    const handleEditClick = useCallback(
      (ev: React.MouseEvent) => {
        ev.stopPropagation();
        openEditModal();
      },
      [openEditModal],
    );

    return (
      <>
        <Menu lazy>
          <MenuButton
            as={IconButton}
            size="sm"
            variant="ghost"
            icon={<EllipsisIcon />}
            onClick={(ev) => {
              ev.stopPropagation();
            }}
          />
          <MenuList
            onClick={(ev) => {
              ev.stopPropagation();
            }}
          >
            <MenuItem icon={<FilePenLineIcon />} onClick={handleEditClick}>
              Edit
            </MenuItem>
            {/* <MenuItem disabled>Make a copy</MenuItem> */}
            <MenuItem color="danger" icon={<TrashIcon color="danger" />} onClick={handleDelete}>
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
        <EditExcludedAppModal appId={rowId} isOpen={isEditModalOpen} onClose={closeEditModal} />
      </>
    );
  },
  () => false,
);

ControlMenu.displayName = "ControlMenu";
