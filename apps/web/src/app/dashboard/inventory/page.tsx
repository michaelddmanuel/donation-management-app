"use client";

import { useState, useMemo } from "react";
import {
  Package,
  Search,
  Filter,
  Plus,
  Download,
  AlertTriangle,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---- Types ----

interface InventoryRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  fair_market_value: number;
  condition: string;
  chapter: string;
  state_code: string;
  source_vendor: string | null;
  expiry_date: string | null;
  updated_at: string;
}

// ---- Mock Data (replace with Supabase query) ----

const CHAPTERS = [
  "All Chapters",
  "California",
  "Texas",
  "New York",
  "Florida",
  "Illinois",
  "Oklahoma",
  "Ohio",
  "Georgia",
  "Arizona",
  "Washington",
];

const mockInventory: InventoryRow[] = [
  { id: "1", sku: "CA-FOOD-001", name: "Canned Soup (Chicken Noodle)", category: "food", quantity: 245, unit: "cans", fair_market_value: 2.49, condition: "new", chapter: "California", state_code: "CA", source_vendor: "Walmart", expiry_date: "2026-08-15", updated_at: "2026-04-03" },
  { id: "2", sku: "CA-BABY-001", name: "Huggies Diapers Size 4", category: "baby_supplies", quantity: 8, unit: "packs", fair_market_value: 28.99, condition: "new", chapter: "California", state_code: "CA", source_vendor: "Amazon", expiry_date: null, updated_at: "2026-04-04" },
  { id: "3", sku: "TX-HYG-001", name: "Oral-B Toothbrush Pack", category: "hygiene", quantity: 120, unit: "packs", fair_market_value: 3.99, condition: "new", chapter: "Texas", state_code: "TX", source_vendor: "Walmart", expiry_date: null, updated_at: "2026-04-01" },
  { id: "4", sku: "TX-BABY-002", name: "Enfamil Baby Formula", category: "baby_supplies", quantity: 3, unit: "cans", fair_market_value: 34.99, condition: "new", chapter: "Texas", state_code: "TX", source_vendor: "Amazon", expiry_date: "2026-12-01", updated_at: "2026-04-05" },
  { id: "5", sku: "NY-CLO-001", name: "Winter Jacket (Adult M)", category: "clothing", quantity: 67, unit: "pieces", fair_market_value: 45.00, condition: "good", chapter: "New York", state_code: "NY", source_vendor: null, expiry_date: null, updated_at: "2026-03-28" },
  { id: "6", sku: "NY-CLO-002", name: "Winter Jacket (Child S)", category: "clothing", quantity: 5, unit: "pieces", fair_market_value: 30.00, condition: "good", chapter: "New York", state_code: "NY", source_vendor: null, expiry_date: null, updated_at: "2026-03-28" },
  { id: "7", sku: "FL-FOOD-003", name: "Rice (5lb bag)", category: "food", quantity: 340, unit: "bags", fair_market_value: 5.99, condition: "new", chapter: "Florida", state_code: "FL", source_vendor: "Walmart", expiry_date: "2027-01-01", updated_at: "2026-04-02" },
  { id: "8", sku: "IL-MED-001", name: "First Aid Kit (Basic)", category: "medical", quantity: 22, unit: "kits", fair_market_value: 12.99, condition: "new", chapter: "Illinois", state_code: "IL", source_vendor: "Amazon", expiry_date: null, updated_at: "2026-03-30" },
  { id: "9", sku: "OK-FOOD-001", name: "Canned Beans (Black)", category: "food", quantity: 890, unit: "cans", fair_market_value: 1.79, condition: "new", chapter: "Oklahoma", state_code: "OK", source_vendor: "Walmart", expiry_date: "2027-06-15", updated_at: "2026-04-04" },
  { id: "10", sku: "CA-HOU-001", name: "Blanket (Queen, Fleece)", category: "household", quantity: 7, unit: "pieces", fair_market_value: 19.99, condition: "new", chapter: "California", state_code: "CA", source_vendor: "Amazon", expiry_date: null, updated_at: "2026-04-01" },
  { id: "11", sku: "GA-SCH-001", name: "Backpack (Kids)", category: "school_supplies", quantity: 150, unit: "pieces", fair_market_value: 15.99, condition: "new", chapter: "Georgia", state_code: "GA", source_vendor: null, expiry_date: null, updated_at: "2026-03-25" },
  { id: "12", sku: "AZ-FOOD-002", name: "Bottled Water (24-pack)", category: "food", quantity: 2, unit: "packs", fair_market_value: 4.99, condition: "new", chapter: "Arizona", state_code: "AZ", source_vendor: "Walmart", expiry_date: "2027-12-01", updated_at: "2026-04-05" },
];

// ---- Helpers ----

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatCategory(cat: string) {
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---- Component ----

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [chapterFilter, setChapterFilter] = useState("All Chapters");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof InventoryRow>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let data = [...mockInventory];

    // Chapter filter
    if (chapterFilter !== "All Chapters") {
      data = data.filter((item) => item.chapter === chapterFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      data = data.filter((item) => item.category === categoryFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.chapter.toLowerCase().includes(q)
      );
    }

    // Sort
    data.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");
      return sortDir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return data;
  }, [search, chapterFilter, categoryFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const lowStockCount = mockInventory.filter((i) => i.quantity < 10).length;
  const totalValue = mockInventory.reduce(
    (sum, i) => sum + i.fair_market_value * i.quantity,
    0
  );

  function toggleSort(field: keyof InventoryRow) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground">
            Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mockInventory.length} items across {CHAPTERS.length - 1} chapters
            {" · "}
            Total value: {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Low stock alert banner */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-300">
            <strong>{lowStockCount} items</strong> are below the minimum stock
            threshold of 10 units. Review and restock immediately.
          </p>
        </div>
      )}

      {/* Filters bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or chapter..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>

            {/* Chapter Filter */}
            <Select
              value={chapterFilter}
              onValueChange={(val) => {
                setChapterFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by chapter" />
              </SelectTrigger>
              <SelectContent>
                {CHAPTERS.map((ch) => (
                  <SelectItem key={ch} value={ch}>
                    {ch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                setCategoryFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="hygiene">Hygiene</SelectItem>
                <SelectItem value="baby_supplies">Baby Supplies</SelectItem>
                <SelectItem value="household">Household</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="school_supplies">School Supplies</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("sku")}
              >
                <div className="flex items-center gap-1">
                  SKU
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Item Name
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("chapter")}
              >
                <div className="flex items-center gap-1">
                  Chapter
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("quantity")}
              >
                <div className="flex items-center gap-1 justify-end">
                  Qty
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="text-right">FMV (Unit)</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  No inventory items found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.sku}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {item.name}
                        </p>
                        {item.source_vendor && (
                          <p className="text-xs text-muted-foreground">
                            via {item.source_vendor}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {formatCategory(item.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center h-6 w-6 rounded bg-primary/10 text-[10px] font-bold text-primary">
                        {item.state_code}
                      </span>
                      <span className="text-sm">{item.chapter}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`font-semibold ${
                          item.quantity < 10
                            ? "text-destructive"
                            : "text-foreground"
                        }`}
                      >
                        {item.quantity}
                      </span>
                      {item.quantity < 10 && (
                        <Badge variant="error" className="gap-1 text-[10px]">
                          <AlertTriangle className="h-3 w-3" />
                          Low
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(item.fair_market_value)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCurrency(item.fair_market_value * item.quantity)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.condition === "new"
                          ? "success"
                          : item.condition === "good"
                          ? "secondary"
                          : "warning"
                      }
                    >
                      {item.condition.charAt(0).toUpperCase() +
                        item.condition.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filtered.length)} of{" "}
              {filtered.length} items
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-9"
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
