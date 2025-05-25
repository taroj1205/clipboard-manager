import { PlusIcon } from "@yamada-ui/lucide";
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
  useDisclosure,
} from "@yamada-ui/react";
import { memo } from "react";
import { useAddExcludedAppForm } from "./utils";

interface AddExcludedAppModalProps {
  trigger?: React.ReactNode;
}

export const AddExcludedAppModal = memo(({ trigger }: AddExcludedAppModalProps) => {
  const { open, onOpen, onClose } = useDisclosure();
  const { register, handleSubmit, errors, onSubmit } = useAddExcludedAppForm(onClose);

  return (
    <>
      {trigger ? (
        <Button variant="ghost" p={0} onClick={onOpen}>
          {trigger}
        </Button>
      ) : (
        <Button startIcon={<PlusIcon />} size="sm" onClick={onOpen}>
          Add Application
        </Button>
      )}
      <Modal open={open} onClose={onClose} as="form" onSubmit={handleSubmit(onSubmit)} onClick={(ev) => ev.stopPropagation()}>
        <ModalOverlay />
        <ModalCloseButton />
        <ModalHeader>Add Excluded Application</ModalHeader>
        <ModalBody>
          <VStack gap="md">
            <FormControl required gap="xs">
              <Text fontSize="sm" fontWeight="medium" mb="xs">
                Application Name
              </Text>
              <Input
                placeholder="e.g., Visual Studio Code"
                {...register("name", { required: "Application name is required" })}
              />
            </FormControl>

            <FormControl required invalid={!!errors.path} errorMessage={errors.path?.message} gap="xs">
              <Text fontSize="sm" fontWeight="medium" mb="xs">
                Application Path or Process Name
              </Text>
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
            <Button type="submit">Add Application</Button>
          </HStack>
        </ModalFooter>
      </Modal>
    </>
  );
});

AddExcludedAppModal.displayName = "AddExcludedAppModal";
