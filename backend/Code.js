/**
 * TAILORFLOW BACKEND - GOOGLE APPS SCRIPT
 * 
 * INSTRUCTIONS:
 * 1. Create a new Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code into Code.gs.
 * 4. Save the project.
 * 5. REFRESH your Google Sheet browser tab. You will see a new menu "TailorFlow App" appear next to "Help".
 * 6. Click "TailorFlow App" > "Setup Database Sheets" to generate the tables.
 * 7. Click "Deploy" > "New Deployment" > Type: "Web App" > Access: "Anyone" > Deploy.
 * 8. Copy the URL to the TailorFlow settings.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('TailorFlow App')
    .addItem('Setup Database Sheets', 'setupSheets')
    .addToUi();
}

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const definitions = [
    { name: 'Users', headers: ['id', 'name', 'email', 'password', 'role', 'createdAt'] },
    { name: 'Orders', headers: ['id', 'json_data', 'status', 'dueDate', 'updatedAt'] },
    { name: 'Customers', headers: ['id', 'json_data', 'phone', 'name', 'updatedAt'] }
  ];
  
  let createdCount = 0;

  definitions.forEach(def => {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
      sheet.appendRow(def.headers);
      sheet.setFrozenRows(1);
      // Make headers bold
      sheet.getRange(1, 1, 1, def.headers.length).setFontWeight("bold");
      createdCount++;
    } else {
      // If sheet exists but is empty, add headers
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(def.headers);
        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, def.headers.length).setFontWeight("bold");
      }
    }
  });

  // If triggered via UI, show an alert
  try {
    SpreadsheetApp.getUi().alert('Database Setup Complete.\nSheets verified: ' + definitions.map(d => d.name).join(', '));
  } catch (e) {
    // If run from trigger or other context where UI is not available, ignore
    console.log("Setup complete");
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // Auto-setup if 'Users' sheet is missing (failsafe)
    if (!SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users')) {
      setupSheets();
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const payload = data.payload;
    
    let result = {};

    switch (action) {
      case 'signup':
        result = handleSignup(payload);
        break;
      case 'login':
        result = handleLogin(payload);
        break;
      case 'getOrders':
        result = getSheetData('Orders');
        break;
      case 'createOrder':
        result = appendData('Orders', payload);
        break;
      case 'updateOrder':
        result = updateOrder(payload);
        break;
      case 'getCustomers':
        result = getSheetData('Customers');
        break;
      case 'createCustomer':
        result = appendData('Customers', payload);
        break;
      default:
        result = { error: 'Invalid action' };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'error': e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function handleSignup(user) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const users = sheet.getDataRange().getValues();
  
  // Check if email exists (column index 2)
  // Start loop from 1 to skip header
  for (let i = 1; i < users.length; i++) {
    if (users[i][2] === user.email) return { error: 'User already exists' };
  }

  const id = 'u' + new Date().getTime();
  // Store user
  sheet.appendRow([id, user.name, user.email, user.password, 'admin', new Date()]);
  
  return { 
    success: true, 
    user: { id, name: user.name, email: user.email, role: 'admin' } 
  };
}

function handleLogin(creds) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const users = sheet.getDataRange().getValues();
  
  // Start from 1 to skip header
  for (let i = 1; i < users.length; i++) {
    // Col 2 = email, Col 3 = password
    if (users[i][2] === creds.email && users[i][3] === creds.password) {
      return { 
        success: true, 
        user: { id: users[i][0], name: users[i][1], email: users[i][2], role: users[i][4] } 
      };
    }
  }
  return { error: 'Invalid credentials' };
}

function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { success: true, data: [] };

  const data = sheet.getDataRange().getValues();
  const results = [];
  
  // Start from 1 to skip headers
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    try {
      // json_data is at index 1
      const obj = JSON.parse(row[1]);
      results.push(obj);
    } catch (e) {
      // ignore rows with bad JSON
    }
  }
  return { success: true, data: results };
}

function appendData(sheetName, item) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  
  if (sheetName === 'Orders') {
    sheet.appendRow([item.id, JSON.stringify(item), item.status, item.dueDate, new Date()]);
  } else if (sheetName === 'Customers') {
    sheet.appendRow([item.id, JSON.stringify(item), item.phone, item.name, new Date()]);
  }
  return { success: true, data: item };
}

function updateOrder(order) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == order.id) {
      // Update columns: id (0), json (1), status (2), date (3), updated (4)
      const range = sheet.getRange(i + 1, 1, 1, 5);
      range.setValues([[order.id, JSON.stringify(order), order.status, order.dueDate, new Date()]]);
      return { success: true };
    }
  }
  return { error: 'Order not found' };
}