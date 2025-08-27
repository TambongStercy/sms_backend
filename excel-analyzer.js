const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Excel Analyzer Script
 * Reads an Excel file and converts each sheet to JSON format
 * Usage: node excel-analyzer.js <path-to-excel-file> [output-file]
 */

function analyzeExcelFile(filePath, outputPath = null) {
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        console.log(`Reading Excel file: ${filePath}`);
        
        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        
        // Get sheet names
        const sheetNames = workbook.SheetNames;
        console.log(`Found ${sheetNames.length} sheet(s): ${sheetNames.join(', ')}`);
        
        // Initialize result object
        const result = {
            fileName: path.basename(filePath),
            filePath: filePath,
            totalSheets: sheetNames.length,
            sheets: {}
        };
        
        // Process each sheet
        sheetNames.forEach((sheetName, index) => {
            console.log(`\nProcessing sheet ${index + 1}/${sheetNames.length}: "${sheetName}"`);
            
            const worksheet = workbook.Sheets[sheetName];
            
            // Get sheet range
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
            
            // Convert to JSON with different formats
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Array of arrays
            const jsonDataWithHeaders = XLSX.utils.sheet_to_json(worksheet); // Array of objects
            
            // Get sheet statistics
            const stats = {
                totalRows: range.e.r + 1,
                totalColumns: range.e.c + 1,
                usedRows: jsonData.length,
                hasHeaders: jsonData.length > 0 && jsonData[0].some(cell => typeof cell === 'string'),
                columnHeaders: jsonData.length > 0 ? jsonData[0] : []
            };
            
            // Store sheet data
            result.sheets[sheetName] = {
                name: sheetName,
                statistics: stats,
                rawData: jsonData, // Array of arrays (includes empty cells)
                formattedData: jsonDataWithHeaders, // Array of objects (excludes empty rows)
                range: `${XLSX.utils.encode_cell(range.s)}:${XLSX.utils.encode_cell(range.e)}`
            };
            
            console.log(`  - Rows: ${stats.totalRows} (${stats.usedRows} with data)`);
            console.log(`  - Columns: ${stats.totalColumns}`);
            console.log(`  - Range: ${result.sheets[sheetName].range}`);
            
            if (stats.hasHeaders && stats.columnHeaders.length > 0) {
                console.log(`  - Headers: ${stats.columnHeaders.filter(h => h).join(', ')}`);
            }
        });
        
        // Output results
        const jsonOutput = JSON.stringify(result, null, 2);
        
        if (outputPath) {
            fs.writeFileSync(outputPath, jsonOutput);
            console.log(`\n✅ Analysis complete! Results saved to: ${outputPath}`);
        } else {
            console.log('\n' + '='.repeat(50));
            console.log('EXCEL ANALYSIS RESULTS');
            console.log('='.repeat(50));
            console.log(jsonOutput);
        }
        
        return result;
        
    } catch (error) {
        console.error(`❌ Error analyzing Excel file: ${error.message}`);
        throw error;
    }
}

// Command line usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node excel-analyzer.js <path-to-excel-file> [output-json-file]');
        console.log('Example: node excel-analyzer.js "C:/path/to/file.xlsx" output.json');
        process.exit(1);
    }
    
    const filePath = args[0];
    const outputPath = args[1];
    
    try {
        analyzeExcelFile(filePath, outputPath);
    } catch (error) {
        process.exit(1);
    }
}

module.exports = { analyzeExcelFile };