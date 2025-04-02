import React, { useState } from "react";
import * as XLSX from "xlsx";
import Handsontable from "handsontable/base";
import { registerAllModules } from "handsontable/registry";
import { HotTable } from "@handsontable/react-wrapper";
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';
registerAllModules();

const HotTableDemo = () => {
  const [tableData, setTableData] = useState([
    ["A1", "B1", "C1"],
    ["A2", "B2", "C2"],
    ["A3", "B3", "C3"],
  ]);
  const [colHeaders, setColHeaders] = useState(["Column 1", "Column 2", "Column 3"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [columnName, setColumnName] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (e) => {
      const data = e.target.result;

      try {
        const workbook = XLSX.read(data, { type: "binary" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (excelData.length > 0) {
          setColHeaders(excelData[0]);

          setTableData(excelData.slice(1));
        } else {
          alert("The uploaded sheet has no data.");
        }
      } catch (err) {
        alert("Failed to read the Excel file. Please try again.");
        console.error(err);
      }
    };
  };

  const handleAddRow = () => {
    const newRow = Array(colHeaders.length).fill(""); 
    setTableData([...tableData, newRow]);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setColumnName("");
  };

  const handleAddColumn = () => {
    if (!columnName.trim()) return;

    const updatedTableData = tableData.map((row) => [...row, ""]);
    setTableData(updatedTableData);

    setColHeaders([...colHeaders, columnName]);

    closeModal();
  };

  return (
    <div className="ht-theme-main-dark-auto">
      <input type="file" accept=".xls,.xlsx,.csv" onChange={handleFileUpload} style={{ marginBottom: "10px" }} />

      <HotTable
        data={tableData}
        autoWrapRow={true}
        autoWrapCol={true}
        licenseKey="non-commercial-and-evaluation"
        width={500}
        height={300}
        colHeaders={colHeaders}
        rowHeaders={true}
        customBorders={true}
        dropdownMenu={true}
        multiColumnSorting={true}
        filters={true}
        manualRowMove={true} 
        manualColumnMove={true} 
        columnSorting={true}
        columnHeaderHeight={40} 
        rowHeaderWidth={50}
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleAddRow} style={{ marginRight: "10px", padding: "8px 12px", cursor: "pointer" }}>
          Add Row
        </button>
        <button onClick={openModal} style={{ padding: "8px 12px", cursor: "pointer" }}>
          Add Column
        </button>
      </div>

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
          <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", minWidth: "300px" }}>
            <h3>Add Column</h3>
            <input
              type="text"
              placeholder="Enter column name"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            <div style={{ textAlign: "right" }}>
              <button onClick={closeModal} style={{ marginRight: "10px", padding: "8px 12px" }}>
                Cancel
              </button>
              <button onClick={handleAddColumn} style={{ padding: "8px 12px" }}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotTableDemo;
