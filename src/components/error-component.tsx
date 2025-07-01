import { ShieldAlertIcon } from '@yamada-ui/lucide';
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIndicator,
  EmptyStateTitle,
} from '@yamada-ui/react';

export const ErrorComponent = () => {
  return (
    <EmptyState>
      <EmptyStateIndicator>
        <ShieldAlertIcon />
      </EmptyStateIndicator>
      <EmptyStateTitle>Error</EmptyStateTitle>
      <EmptyStateDescription>
        An error occurred while loading the page.
      </EmptyStateDescription>
    </EmptyState>
  );
};
