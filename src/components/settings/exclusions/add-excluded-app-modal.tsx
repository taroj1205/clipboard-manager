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
  useDisclosure,
  VStack,
} from "@yamada-ui/react";
import { memo } from "react";
import { useAddExcludedAppForm } from "./utils";

interface AddExcludedAppModalProps {
  trigger?: React.ReactNode;
}

export const AddExcludedAppModal = memo(
  ({ trigger }: AddExcludedAppModalProps) => {
    const { onClose, onOpen, open } = useDisclosure();
    const { handleSubmit, register, errors, onSubmit } =
      useAddExcludedAppForm(onClose);

    return (
      <>
        {trigger ? (
          <Button onClick={onOpen} p={0} variant="ghost">
            {trigger}
          </Button>
        ) : (
          <Button onClick={onOpen} size="sm" startIcon={<PlusIcon />}>
            Add Application
          </Button>
        )}
        <Modal
          as="form"
          onClick={(ev) => ev.stopPropagation()}
          onClose={onClose}
          onSubmit={handleSubmit(onSubmit)}
          open={open}
        >
          <ModalOverlay />
          <ModalCloseButton />
          <ModalHeader>Add Excluded Application</ModalHeader>
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
                  You can specify either the executable name (e.g.,
                  "chrome.exe") or the full path
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack gap="sm">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button type="submit">Add Application</Button>
            </HStack>
          </ModalFooter>
        </Modal>
      </>
    );
  }
);

AddExcludedAppModal.displayName = "AddExcludedAppModal";
