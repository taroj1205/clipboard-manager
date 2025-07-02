import {
  Button,
  FormControl,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@yamada-ui/react";
import type { FC } from "react";
import { memo } from "react";
import { useEditExcludedAppForm } from "./utils";

interface EditExcludedAppModalProps {
  appId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EditExcludedAppModal: FC<EditExcludedAppModalProps> = memo(
  ({ appId, isOpen, onClose }) => {
    const { handleSubmit, register, errors, onSubmit } = useEditExcludedAppForm(
      appId,
      onClose
    );
    return (
      <Modal
        as="form"
        onClick={(e) => e.stopPropagation()}
        onClose={onClose}
        onSubmit={handleSubmit(onSubmit)}
        open={isOpen}
      >
        <ModalOverlay onClick={(e) => e.stopPropagation()} />
        <ModalCloseButton />
        <ModalHeader>Edit Excluded Application</ModalHeader>
        <ModalBody>
          <VStack gap="md">
            <FormControl
              display="flex"
              flexDirection="column"
              gap="xs"
              required
            >
              <Text fontSize="sm">Application Name</Text>
              <Input
                placeholder="e.g., Visual Studio Code"
                {...register("name", {
                  required: "Application name is required",
                })}
              />
            </FormControl>

            <FormControl
              display="flex"
              errorMessage={errors.path?.message}
              flexDirection="column"
              gap="xs"
              invalid={!!errors.path}
              required
            >
              <Text fontSize="sm">Application Path or Process Name</Text>
              <Input
                fontFamily="mono"
                fontSize="sm"
                placeholder="e.g., Code.exe or C:\\Program Files\\..."
                {...register("path", {
                  required: "Application path is required",
                })}
              />
              <Text color="muted" fontSize="xs">
                You can specify either the executable name (e.g., "chrome.exe")
                or the full path
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack gap="sm">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit">Update Application</Button>
          </HStack>
        </ModalFooter>
      </Modal>
    );
  }
);

EditExcludedAppModal.displayName = "EditExcludedAppModal";
