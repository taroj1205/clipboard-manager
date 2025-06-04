import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Dialog,
  DialogBody,
  DialogHeader,
  Text,
  VStack,
  useDisclosure,
  useNotice,
} from "@yamada-ui/react";
import { memo, useCallback } from "react";
import { deleteAllClipboardEntries } from "~/db/clipboard-entries";

export const DeleteAll = memo(() => {
  const { open, onOpen, onClose } = useDisclosure();
  const notice = useNotice();

  const handleDelete = useCallback(async () => {
    try {
      await deleteAllClipboardEntries();
      notice({
        status: "success",
        title: "Success",
        description: "All clipboard entries have been deleted.",
      });
    } catch (error) {
      notice({
        status: "error",
        title: "Error",
        description: "Failed to delete all clipboard entries.",
      });
    }
    onClose();
  }, [onClose, notice]);

  return (
    <VStack>
      <Alert status="warning" variant="subtle" colorScheme="danger">
        <AlertIcon />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This will delete all clipboard entries. This action cannot be undone.</AlertDescription>
      </Alert>
      <Button onClick={onOpen} colorScheme="danger" w="fit-content">
        Delete All Entries
      </Button>
      <Dialog open={open} onClose={onClose}>
        <DialogHeader>Delete All Entries</DialogHeader>
        <DialogBody>
          <Text>Are you sure you want to delete all clipboard entries? This action cannot be undone.</Text>
          <Button onClick={handleDelete} colorScheme="danger" w="fit-content">
            Delete All Entries
          </Button>
        </DialogBody>
      </Dialog>
    </VStack>
  );
});
