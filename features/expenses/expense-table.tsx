"use client";

import { useMemo, useState, useTransition } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteExpense } from "@/features/shared/actions";
import { formatINR } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Row = {
  id: string;
  date: string;
  categoryName: string;
  categoryId: string;
  amountPaise: number;
  merchant: string | null;
  notes: string | null;
};

export function ExpenseTable({
  expenses,
  categories,
}: {
  expenses: Row[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [category, setCategory] = useState("all");
  const [pending, start] = useTransition();

  const data = useMemo(() => {
    if (category === "all") return expenses;
    return expenses.filter((e) => e.categoryId === category);
  }, [expenses, category]);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: "date", header: "Date" },
      { accessorKey: "categoryName", header: "Category" },
      {
        accessorKey: "merchant",
        header: "Merchant",
        cell: ({ getValue }) => (getValue() as string) || "—",
      },
      {
        accessorKey: "amountPaise",
        header: "Amount",
        cell: ({ getValue }) => formatINR(getValue() as number),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              start(async () => {
                await deleteExpense(row.original.id);
                toast.success("Deleted");
                router.refresh();
              });
            }}
          >
            Delete
          </Button>
        ),
      },
    ],
    [pending, router]
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-sm">All expenses</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-40 sm:w-56"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border/60 text-left text-muted-foreground">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-2 py-2 font-medium">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/40">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-2 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
