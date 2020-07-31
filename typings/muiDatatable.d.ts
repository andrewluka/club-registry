import { ReactNode } from "react";
import { MUIDataTableMeta } from "mui-datatables";

export type MUIDatatableRenderer<T = any> = (
  value: T,
  tableMeta: MUIDataTableMeta,
  updateValue: (value: string) => void
) => ReactNode | string;
