function dataChineseToAD (dateString) {
  
  // 2021年5月7日
  let posYear = dateString.indexOf('年')
  let posMonth = dateString.indexOf('月')
  let posDay = dateString.indexOf('日')
  
  if (posYear === -1
          || posMonth === -1
          || posDay === -1) {
    return dateString
  }
  
  let partYear = dateString.slice(0, posYear)
  let partMonth = dateString.slice(posYear+1, posMonth)
  let partDay = dateString.slice(posMonth+1, posDay)
  
  if (partYear.startsWith(`'`) || partYear.startsWith(`"`)) {
    partYear = partYear.slice(1)
  }
  
  partYear = Number(partYear)
  partMonth = Number(partMonth)
  if (partMonth < 10) {
    partMonth = '0' + partMonth
  }
  partDay = Number(partDay)
  if (partDay < 10) {
    partDay = '0' + partDay
  }
  
  
  
  if (partYear < 1980) {
    partYear = partYear + 1911
  }
  
  return `'${partYear}-${partMonth}-${partDay}'`
}

function checkIsTimeSeriesMode (fields, dateFields, timestampFields) {
  for (let len = fields.length, i = len; i > 0; i--) {
    let field = fields[(len - i)]
    
    if (dateFields.indexOf(field) > -1
            || timestampFields.indexOf(field) > -1) {
      return true
    }
  }
  return false
}


function lineToValue (line) {
  return line.trim().split(',').map(_value => {
    if (_value.startsWith('"') && _value.endsWith('"')) {
      _value = _value.slice(1, -1)
    }
    if (_value.startsWith("'") && _value.endsWith("'")) {
      _value = _value.slice(1, -1)
    }
    return _value
  })
}

function getIndexFromFields(baseFields, findFields) {
  for (let len = baseFields.length, i = len; i > 0; i--) {
    let index = (len - i)
    let field = baseFields[index]
    if (findFields.indexOf(field) > -1) {
      return index
    }
  }
  return -1
}

function tryToConvertNumber (value) {
  let originalValue = value
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1)
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    value = value.slice(1, -1)
  }
  
  if (isNaN(value)) {
    return originalValue
  }
  else {
    return Number(value)
  }
}