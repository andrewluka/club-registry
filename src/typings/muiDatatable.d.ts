import { ReactNode } from "react";
import { MUIDataTableMeta } from "mui-datatables";

export interface MUIDatatableRendererArgsAsProps<T> {
  value: T;
  tableMeta: MUIDataTableMeta;
  updateValue: (value: string) => void;
}

export type MUIDatatableRenderer<T = any> = (
  value: T,
  tableMeta: MUIDataTableMeta,
  updateValue: (value: string) => void
) => ReactNode | string;
