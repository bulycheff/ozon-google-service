function generateFields(rowData, titleHeader = 'Новая заявка') {
  
  const date = new Date(Date.now() + 60 * 1000 * 5).toISOString();
  return {
    TITLE: `Озон Самозанятые ${rowData[3]} ${rowData[5]} ${rowData[4]} ${rowData[11]} | ${titleHeader}`,
    DESCRIPTION: rowData.filter((cell) => cell !== '').join('\n'),
    CREATED_BY: 217,
    
    // ответственный
    RESPONSIBLE_ID: 291,
    // RESPONSIBLE_ID: 47,
    
    // соисполнители
    ACCOMPLICES: [1],
    
    // наблюдатели
    AUDITORS: [291],
    // AUDITORS: [1],
    
    // крайний срок
    DEADLINE: date,
    
    TASK_CONTROL: 'Y',
  };
}

module.exports = { generateFields };
