// Table Component
export interface TableColumn {
  key: string;
  title: string;
  width?: number;
}

export interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export function Table({ columns, data, onRowClick }: TableProps) {
  return {
    columns,
    data,
    onRowClick
  };
}
