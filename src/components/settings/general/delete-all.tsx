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
  useDisclosure,
  useNotice,
  VStack,
} from '@yamada-ui/react';
import { memo, useCallback } from 'react';
import { deleteAllClipboardEntries } from '~/db/clipboard-entries';

export const DeleteAll = memo(() => {
  const { onClose, onOpen, open } = useDisclosure();
  const notice = useNotice();

  const handleDelete = useCallback(async () => {
    try {
      await deleteAllClipboardEntries();
      notice({
        status: 'success',
        title: 'Success',
        description: 'All clipboard entries have been deleted.',
      });
    } catch (_error) {
      notice({
        status: 'error',
        title: 'Error',
        description: 'Failed to delete all clipboard entries.',
      });
    }
    onClose();
  }, [onClose, notice]);

  return (
    <VStack>
      <Alert colorScheme="danger" status="warning" variant="subtle">
        <AlertIcon />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          This will delete all clipboard entries. This action cannot be undone.
        </AlertDescription>
      </Alert>
      <Button colorScheme="danger" onClick={onOpen} w="fit-content">
        Delete All Entries
      </Button>
      <Dialog onClose={onClose} open={open}>
        <DialogHeader>Delete All Entries</DialogHeader>
        <DialogBody>
          <Text>
            Are you sure you want to delete all clipboard entries? This action
            cannot be undone.
          </Text>
          <Button colorScheme="danger" onClick={handleDelete} w="fit-content">
            Delete All Entries
          </Button>
        </DialogBody>
      </Dialog>
    </VStack>
  );
});

DeleteAll.displayName = 'DeleteAll';
