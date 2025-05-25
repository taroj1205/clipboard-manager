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
import { type FC, memo } from "react";
import { useEditExcludedAppForm } from "./utils";

interface EditExcludedAppModalProps {
  appId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EditExcludedAppModal: FC<EditExcludedAppModalProps> = memo(({ appId, isOpen, onClose }) => {
  const { register, handleSubmit, errors, onSubmit } = useEditExcludedAppForm(appId, onClose);
  return (
    <Modal open={isOpen} onClose={onClose} as="form" onSubmit={handleSubmit(onSubmit)} onClick={(e) => e.stopPropagation()}>
      <ModalOverlay onClick={(e) => e.stopPropagation()} />
      <ModalCloseButton />
      <ModalHeader>Edit Excluded Application</ModalHeader>
      <ModalBody>
        <VStack gap="md">
          <FormControl required gap="xs" display="flex" flexDirection="column">
            <Text fontSize="sm">Application Name</Text>
            <Input placeholder="e.g., Visual Studio Code" {...register("name", { required: "Application name is required" })} />
          </FormControl>

          <FormControl
            required
            invalid={!!errors.path}
            errorMessage={errors.path?.message}
            gap="xs"
            display="flex"
            flexDirection="column"
          >
            <Text fontSize="sm">Application Path or Process Name</Text>
            <Input
              placeholder="e.g., Code.exe or C:\\Program Files\\..."
              fontFamily="mono"
              fontSize="sm"
              {...register("path", { required: "Application path is required" })}
            />
            <Text fontSize="xs" color="muted">
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
