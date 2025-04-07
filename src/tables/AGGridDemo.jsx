import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  ClientSideRowModelModule,
  MenuModule,
  ClipboardModule,
  TextEditorModule,
  ColumnAutoSizeModule, 
} from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  MenuModule,
  ClipboardModule,
  TextEditorModule,
  ColumnAutoSizeModule, 
]);

const AgGridDemo = () => {
  const gridRef = useRef(null);
  const [columnApi, setColumnApi] = useState(null);
  const [rowData, setRowData] = useState([
    { col1: "A1", col2: "B1", col3: "C1" },
    { col1: "A2", col2: "B2", col3: "C2" },
    { col1: "A3", col2: "B3", col3: "C3" },
  ]);
  const [columnDefs, setColumnDefs] = useState([
    {
      field: "col1",
      headerName: "Column 1",
      maxWidth: 300,
      editable: true,
      cellEditor: "agTextCellEditor",
    },
    {
      field: "col2",
      width: 50,
      headerName: "Column 2",
      editable: true,
      cellEditor: "agTextCellEditor",
    },
    {
      field: "col3",
      width: 90,
      headerName: "Column 3",
      editable: true,
      cellEditor: "agTextCellEditor",
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const autoSizeStrategy = useMemo(() => {
    return {
      type: "fitGridWidth",
      defaultMinWidth: 100,
      columnLimits: [
        {
          colId: "country", 
          minWidth: 900,
        },
      ],
    };
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewColumnName("");
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;

    setColumnDefs([
      ...columnDefs,
      { field: newColumnName, headerName: newColumnName, editable: true },
    ]);

    setRowData(rowData.map((row) => ({ ...row, [newColumnName]: "" })));

    closeModal();
  };

  const handleAddRow = () => {
    const newRow = columnDefs.reduce((acc, col) => {
      acc[col.field] = "";
      return acc;
    }, {});
    setRowData([...rowData, newRow]);
  };

  const autoSizeThisColumn = (params) => {
    if (columnApi) {
      const currentColumn = params.column;
      columnApi.autoSizeColumns([currentColumn]);
      if (autoSizeStrategy) {
        columnApi.getAllColumns().forEach((col) => {
          if (col.getColId() === currentColumn.getColId()) {
            columnApi.autoSizeColumns([col]);
          }
        });
      }
    }
  };

  const autoSizeAllColumns = () => {
    if (columnApi) {
      const allColumns = columnApi.getAllColumns();
      columnApi.autoSizeColumns(allColumns);
      if (autoSizeStrategy) {
        columnApi.getAllColumns().forEach((col) => {
          columnApi.autoSizeColumns([col]);
        });
      }
    }
  };

  const onCellValueChanged = useCallback((event) => {
    const updatedData = event.data;
    setRowData((prevRowData) => {
      const updatedRowData = prevRowData.map((row) => {
        if (row === updatedData) {
          return updatedData; 
        }
        return row;
      });
      return updatedRowData;
    });
  }, []);

  const getMainMenuItems = useCallback(
    (params) => {
      return [
        ...params.defaultItems,
        "separator",
        {
          name: "Auto-size This Column",
          action: () => autoSizeThisColumn(params),
        },
        {
          name: "Auto-size All Columns",
          action: () => autoSizeAllColumns(),
        },
      ];
    },
    [columnApi]
  );

  const getContextMenuItems = useCallback(
    (params) => {
      return [
        ...(params.defaultItems || []),
        "separator",
        {
          name: "Auto-size This Column",
          action: () => autoSizeThisColumn(params),
        },
        {
          name: "Auto-size All Columns",
          action: () => autoSizeAllColumns(),
        },
      ];
    },
    [columnApi]
  );

  const onGridReady = (params) => {
    setColumnApi(params.columnApi); 
  };

  const sizeToFit = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.sizeColumnsToFit();
    }
  }, []);

  return (
    <div>
      <button onClick={sizeToFit}>Resize Columns to Fit Grid Width</button>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={handleAddRow}>Add Row</button>
        <button onClick={openModal}>Add Column</button>
      </div>

      {/* Modal for adding column */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "300px",
            }}
          >
            <h3>Add Column</h3>
            <input
              type="text"
              placeholder="Enter column name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            <div style={{ textAlign: "right" }}>
              <button
                onClick={closeModal}
                style={{ marginRight: "10px", padding: "8px 12px" }}
              >
                Cancel
              </button>
              <button onClick={handleAddColumn} style={{ padding: "8px 12px" }}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AG Grid */}
      <div
        className="ag-theme-alpine"
        style={{ height: 400, width: "100%", marginTop: "20px" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          rowSelection="multiple"
          animateRows={true}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
          }}
          domLayout="autoHeight"
          contextMenuItems={getContextMenuItems}
          getMainMenuItems={getMainMenuItems}
          onGridReady={onGridReady} 
          onCellValueChanged={onCellValueChanged} 
        />
      </div>
    </div>
  );
};

export default AgGridDemo;
