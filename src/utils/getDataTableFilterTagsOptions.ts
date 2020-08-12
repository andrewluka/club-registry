import { MUIDataTableColumnOptions } from "mui-datatables";

interface Options {
  allGameTags: string[];
}

export const getDataTableFilterTagsOptions = ({
  allGameTags,
}: Options): MUIDataTableColumnOptions => ({
  filterOptions: {
    names: allGameTags,
    logic: (prop, filterValues) => {
      const filterValue = ((filterValues[0] || "") as string).toLowerCase();

      return !prop.toLowerCase().includes(filterValue);
    },
  },
});
