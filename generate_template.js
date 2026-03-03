const XLSX = require('xlsx');

const data = [
    {
        "Part ID": "AC-COMP-12K",
        "Quantity": 2,
        "Serial No": "AC-COMP-12K-001",
        "Invoice No": "INV-2026-001"
    },
    {
        "Part ID": "AC-COMP-12K",
        "Quantity": 2,
        "Serial No": "AC-COMP-12K-002",
        "Invoice No": "INV-2026-001"
    },
    {
        "Part ID": "AC-FAN-IN",
        "Quantity": 5,
        "Serial No": "FN-001",
        "Invoice No": "INV-2026-001"
    }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Inbound Data");

// Save the file to Desktop for easy access
const fs = require('fs');
const path = require('path');
const homeDir = process.env.USERPROFILE || process.env.HOME;
const desktopPath = path.join(homeDir, 'Desktop', 'Inbound_Template_v2.xlsx');

XLSX.writeFile(workbook, desktopPath);
console.log(`Excel template generated successfully at: ${desktopPath}`);
