function convertToCellAddress(rowIndex, colIndex) {
  return `${indexToColumn(colIndex)}${rowIndex + 1}`;
}

function indexToColumn(index) {
  let column = index + 1;
  let temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function letterToColumn(letter) {
  let column = 0, length = letter.length;
  for (let i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}

module.exports = { convertToCellAddress };
