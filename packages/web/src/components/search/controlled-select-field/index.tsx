import type { JSX } from "preact";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IS_TEST_ENV } from "@/features/search/constants";
import type { SelectOption } from "@/features/search/types";

type ControlledSelectFieldProps = {
  id: string;
  value: string;
  options: SelectOption[];
  className?: string;
  onValueChange: (value: string) => void;
};

const ControlledSelectField = ({
  className,
  id,
  onValueChange,
  options,
  value,
}: ControlledSelectFieldProps) => {
  if (IS_TEST_ENV) {
    return (
      <select
        id={id}
        value={value}
        onChange={(event: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
          onValueChange(event.currentTarget.value)
        }
        className={className}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => nextValue && onValueChange(nextValue)}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ControlledSelectField;
