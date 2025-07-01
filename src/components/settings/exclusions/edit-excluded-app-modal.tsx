import type { FC } from "react";
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
import { memo } from "react";
import { useEditExcludedAppForm } from "./utils";

interface EditExcludedAppModalProps {
  appId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EditExcludedAppModal: FC<EditExcludedAppModalProps> = memo(({ appId, isOpen, onClose }) => {
  const { handleSubmit, register, errors, onSubmit } = useEditExcludedAppForm(appId, onClose);
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
          <FormControl display="flex" gap="xs" required flexDirection="column">
            <Text fontSize="sm">Application Name</Text>
            <Input
              placeholder="e.g., Visual Studio Code"
              {...register("name", { required: "Application name is required" })}
            />
          </FormControl>

          <FormControl
            invalid={!!errors.path}
            display="flex"
            gap="xs"
            required
            errorMessage={errors.path?.message}
            flexDirection="column"
          >
            <Text fontSize="sm">Application Path or Process Name</Text>
            <Input
              fontFamily="mono"
              fontSize="sm"
              placeholder="e.g., Code.exe or C:\\Program Files\\..."
              {...register("path", { required: "Application path is required" })}
            />
            <Text color="muted" fontSize="xs">
              You can specify either the executable name (e.g., "chrome.exe") or the full path
            </Text>
          </FormControl>
        </VStack>
      </ModalBody>
      <ModalFooter>
        <HStack gap="sm">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Update Application</Button>
        </HStack>
      </ModalFooter>
    </Modal>
  );
});

EditExcludedAppModal.displayName = "EditExcludedAppModal";
