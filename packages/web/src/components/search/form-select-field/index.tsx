import type { JSX } from "preact";
import { useMemo, useState } from "preact/hooks";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IS_TEST_ENV } from "@/features/search/constants";
import type { SelectOption } from "@/features/search/types";

type FormSelectFieldProps = {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  options: SelectOption[];
  className?: string;
};

const FormSelectField = ({
  className,
  defaultValue,
  id,
  label,
  name,
  options,
}: FormSelectFieldProps) => {
  const [value, setValue] = useState(defaultValue);
  const resolvedOptions = useMemo(() => {
    const map = new Map(options.map((option) => [option.value, option]));
    if (defaultValue && !map.has(defaultValue)) {
      map.set(defaultValue, { value: defaultValue, label: defaultValue });
    }
    return [...map.values()];
  }, [defaultValue, options]);

  const field = IS_TEST_ENV ? (
    <select
      id={id}
      name={name}
      aria-label={label}
      value={value}
      onChange={(event: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
        setValue(event.currentTarget.value)
      }
      className={className}
    >
      {resolvedOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ) : (
    <>
      <input type="hidden" name={name} value={value} />
      <Select
        value={value}
        onValueChange={(nextValue) => nextValue && setValue(nextValue)}
      >
        <SelectTrigger id={id} className={className}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {resolvedOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {field}
    </div>
  );
};

export default FormSelectField;
