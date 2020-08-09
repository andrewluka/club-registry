/** @jsx jsx */
import { jsx } from "@emotion/core";
import { FC, ChangeEvent } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  createFilterOptions,
  AutocompleteProps,
} from "@material-ui/lab/Autocomplete";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type AvailableOriginalAutocompleteProps = AutocompleteProps<
  string,
  true,
  false,
  true
>;

export type OnChangeEventHandler = (
  event: ChangeEvent<{}>,
  tags: string[]
) => void;

export type OnAddEventHandler = (newAddition: string, tags: string[]) => void;

interface Props
  extends Pick<
    AvailableOriginalAutocompleteProps,
    Exclude<
      keyof AvailableOriginalAutocompleteProps,
      | "renderInput"
      | "multiple"
      | "value"
      | "onChange"
      | "filterOptions"
      | "selectOnFocus"
      | "clearOnBlur"
      | "handleHomeEndKeys"
      | "options"
      | "getOptionLabel"
      | "freeSolo"
    >
  > {
  options: string[];
  selectedTags: string[];
  onAdd: OnAddEventHandler;
  onChange: OnChangeEventHandler;
  label?: string;
}

export const TagsAutoComplete: FC<Props> = ({
  options,
  onChange,
  onAdd,
  selectedTags,
  label,
  ...autoCompleteProps
}) => {
  const filter = createFilterOptions<string>();

  return (
    <Autocomplete
      css={{ width: 300 }}
      ChipProps={{
        color: "primary",
      }}
      {...autoCompleteProps}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="standard" />
      )}
      multiple
      value={selectedTags.filter(Boolean)}
      onChange={(event, newValue, reason, details) => {
        if (reason === "create-option") {
          onAdd(details?.option ?? "", newValue);
        } else {
          onChange?.(event, newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        if (params.inputValue !== "") {
          filtered.push(params.inputValue);
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={[...new Set(options)]}
      getOptionLabel={(option) => option}
      freeSolo
    />
  );
};
