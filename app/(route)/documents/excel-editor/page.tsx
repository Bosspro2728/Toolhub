//@ts-nocheck
"use client";
import { useState, useRef, useEffect } from "react";
import { read, utils, writeFileXLSX } from "xlsx";
import { DataGrid, textEditor } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { FileSpreadsheet, Upload, Download, RefreshCw, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PageHeader } from '@/components/shared/page-header';
import ToolWrapper from '@/components/shared/tool-wrapper';
import { Separator } from "@/components/ui/separator";

export default function ExcelEditor() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef(null);

  const handleFileUpload = (e:any) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt:any) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
      //@ts-ignore
      if (jsonData.length === 0 || (jsonData[0]?.length ?? 0) === 0) {
        setColumns([]);
        setRows([]);
        toast.error("The Excel sheet or CSV file is empty.");
        return;
      }
      //@ts-ignore
      const headers = jsonData[0].map((header, index) => ({
        key: index.toString(),
        name: header || `Column ${index + 1}`,
        renderEditCell: textEditor,
        resizable: true,
        sortable: true,
      }));

      const dataRows = jsonData.slice(1).map((row, rowIndex) => {
        const rowData = { id: rowIndex.toString() };
        headers.forEach((col, colIndex) => {
          rowData[col.key] = row[colIndex] !== undefined ? row[colIndex] : "";
        });
        return rowData;
      });

      setColumns(headers);
      setRows(dataRows);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    if (columns.length === 0 || rows.length === 0) return;

    const headers = columns.map((col) => col.name);
    const data = [
      headers,
      ...rows.map((row) => columns.map((col) => row[col.key] || "")),
    ];

    const worksheet = utils.aoa_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Sheet1");
    writeFileXLSX(workbook, fileName ? fileName : "SpreadsheetData.xlsx");
  };

  const handleRowsChange = (newRows) => {
    setRows(newRows);
  };

  const handleAddRow = () => {
    const newRow = { id: `${rows.length}` };
    columns.forEach((col) => {
      newRow[col.key] = "";
    });
    setRows([...rows, newRow]);
  };

  const handleAddColumn = () => {
    const newColumnKey = columns.length.toString();
    const newColumn = {
      key: newColumnKey,
      name: `Column ${columns.length + 1}`,
      renderEditCell: textEditor,
      resizable: true,
      sortable: true,
    };

    setColumns([...columns, newColumn]);

    const updatedRows = rows.map((row) => ({
      ...row,
      [newColumnKey]: "",
    }));

    setRows(updatedRows);
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  useEffect(() => {
    const handler = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Excel Editor"
        description="Create and edit spreadsheets online"
      />
      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ToolWrapper title="Spreadsheet Editor">
            <div className="space-y-4" ref={containerRef}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                    disabled={columns.length === 0}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    Add Row
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddColumn}
                    disabled={rows.length === 0}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    Add Column
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={columns.length === 0 || rows.length === 0}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600">
                      <Upload className="mr-2 h-4 w-4" />
                      Import
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullScreen}
                    className="h-8 w-8 p-0 border-gray-300 dark:border-gray-600"
                    title="Toggle Fullscreen"
                  >
                    {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    <span className="sr-only">Toggle fullscreen</span>
                  </Button>
                </div>
              </div>

              <div
                className={`relative ${isFullScreen ? 'fixed inset-0 z-50 max-w-full max-h-full rounded-none' : ''}`}
                style={isFullScreen ? { height: '100vh' } : {}}
              >
                {columns.length > 0 ? (
                  <div className="h-[500px] border-b border-gray-200 dark:border-gray-700">
                    <DataGrid
                      columns={columns}
                      rows={rows}
                      onRowsChange={handleRowsChange}
                      className="data-grid rdg-light dark:rdg-dark h-full"
                      style={{
                        height: "100%",
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center p-4">
                    <FileSpreadsheet className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                      No Spreadsheet Loaded
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                      Import an Excel file (.xlsx, .xls) or CSV file to get started with editing
                    </p>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                        <Upload className="mr-2 h-4 w-4" />
                        Import Spreadsheet
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ToolWrapper>
        </div>

        <div className="space-y-6">
          <ToolWrapper title="Spreadsheet Tips">
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Basic Operations</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Import Excel (.xlsx, .xls) or CSV files</li>
                  <li>• Edit cells directly by clicking on them</li>
                  <li>• Add new rows and columns as needed</li>
                  <li>• Export your edited spreadsheet</li>
                  <li>• Resize columns by dragging headers</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Keyboard Shortcuts</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Enter: Edit cell</li>
                  <li>• Tab: Move right</li>
                  <li>• Shift + Tab: Move left</li>
                  <li>• Arrow keys: Navigate cells</li>
                  <li>• Ctrl + C/V: Copy/Paste</li>
                </ul>
              </div>
            </div>
          </ToolWrapper>

          {/* <ToolWrapper title="Pro Features">
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Advanced Formulas</p>
                <p className="text-sm text-muted-foreground">
                  Use complex formulas and functions
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Data Visualization</p>
                <p className="text-sm text-muted-foreground">
                  Create charts and graphs
                </p>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">Real-time Collaboration</p>
                <p className="text-sm text-muted-foreground">
                  Work together with your team
                </p>
              </div>
              <div className="mt-4 text-center">
                <Button>Upgrade to Pro</Button>
              </div>
            </div>
          </ToolWrapper> */}
        </div>
      </div>
    </div>
  );
}