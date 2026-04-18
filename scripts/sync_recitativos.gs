/**
 * SCRIPT PARA GOOGLE SHEETS - SINCRONIZAÇÃO DE RECITATIVOS
 * 
 * Como usar:
 * 1. No Google Sheets (sua planilha 1q7biq...), vá em Extensões > Apps Script.
 * 2. Apague tudo e cole este código.
 * 3. Clique em "Implantar" > "Nova implantação".
 * 4. Tipo: "App da Web".
 * 5. Descrição: "Webhook Recitativos".
 * 6. Executar como: "Eu".
 * 7. Quem tem acesso: "Qualquer pessoa" (ou "Anyone").
 * 8. Clique em "Implantar" e copie a URL gerada.
 * 9. Cole essa URL no seu arquivo .env na variável WEBHOOK_RECITATIVOS.
 */

function doPost(e) {
  try {
    const sheetId = "1q7biqOZnhTOfsrdUlQAltuyp-SMTt4lDO_0x8JpOL4U";
    const ss = SpreadsheetApp.openById(sheetId);
    let sheet = ss.getSheetByName("Recitativos");
    
    // Cria a aba se não existir
    if (!sheet) {
      sheet = ss.insertSheet("Recitativos");
      sheet.appendRow([
        "Data de Criação", 
        "Data da Reunião", 
        "Meninas", 
        "Meninos", 
        "Moças", 
        "Moços", 
        "Total Recitativos", 
        "Total Comparecimento", 
        "Município", 
        "Comum", 
        "Auxiliar ID", 
        "Auxiliar e-mail", 
        "Auxiliar Nome"
      ]);
      // Formatação básica para o cabeçalho
      sheet.getRange(1, 1, 1, 13).setFontWeight("bold").setBackground("#f3f3f3");
    }

    const data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),
      data.data_reuniao || "",
      data.meninas || 0,
      data.meninos || 0,
      data.mocas || 0,
      data.mocos || 0,
      data.total_recitativos || 0,
      data.total_comparecimento || 0,
      data.municipio || "",
      data.comum || "",
      data.auxiliar_id || "",
      data.auxiliar_email || "",
      data.auxiliar_nome || ""
    ]);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
