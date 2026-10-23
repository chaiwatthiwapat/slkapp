import { Button, Icon, Input, type InputProps } from '../../components/ui';

interface LookupFieldProps extends InputProps {
  onLookup: () => void;
  lookupLabel: string;
}
export function LookupField({ onLookup, lookupLabel, ...input }: LookupFieldProps) {
  return (
    <div className="lookup-field">
      <Input {...input} />
      <Button
        variant="ghost"
        tone="secondary"
        className="lookup-trigger"
        aria-label={lookupLabel}
        title={lookupLabel}
        onClick={onLookup}
      >
        <Icon name="search" size={15} />
      </Button>
    </div>
  );
}
