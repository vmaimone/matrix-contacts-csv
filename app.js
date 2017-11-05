const App = window.App = {
  elements: {
    output: document.querySelector('#output'),
    fileInput: document.querySelector('#file-input'),
    downloadButton: document.querySelector('#download-button')
  },
  data: {
    blobOptions: { type: 'application/octet-binary' },
    downloadName: 'MatrixContacts.out.csv',
  },
  generateCsv() {
    if (!window.FileReader) {
      return alert('FileReader not supported in this browser.')
    } else {
      const reader = new FileReader()
      const file = App.elements.fileInput.files[0]
      App.data.downloadName = file.name.replace(/\.csv$/i, '.out.csv')
      reader.readAsText(file)
      reader.onload = onload
      reader.onerror = onerror
    }
  },
  initialize() {
    App.elements.fileInput.onchange = function(event) {
      return App.generateCsv()
    }
    App.elements.fileInput.focus()
  }
}

/* ========================================================================= */

function onload(event) {
  /* get the csv and show a preview of the results */
  const csv = processData(event.target.result)
  App.elements.output.innerHTML = csv

  /* set up the download link */
  const fileBlob = new Blob([ csv ], App.data.blobOptions)
  const uri = URL.createObjectURL(fileBlob)
  App.elements.downloadButton.setAttribute('href', uri)
  App.elements.downloadButton.setAttribute('download', App.data.downloadName)
}

function onerror(event) {
  if (event.target.error.name === 'NotReadableError') {
    alert('Cannot read file!')
  }
}

function processData(csv) {
  /* expecting a broken csv format (with an extra carriage return per line) */
  const fixedFile = csv.replace(/\r\r\n/g, '\r\n')
  const lines = fixedFile.split('\r\n')
  const headers = [ 'FirstName', 'LastName', 'MiddleName', 'Prefix', 'Suffix', 'LabelSalutation', 'Company', 'JobTitle', 'SpouseFirstName', 'SpouseLastName', 'SpouseMiddleName', 'HomeAddress1', 'HomeAddress2', 'HomeCity', 'HomeState', 'HomeZip', 'HomeZip4', 'WorkAddress1', 'WorkAddress2', 'WorkCity', 'WorkState', 'WorkZip', 'WorkZip4', 'OtherAddress1', 'OtherAddress2', 'OtherCity', 'OtherState', 'OtherZip', 'OtherZip4', 'HomePhone', 'WorkPhone', 'MobilePhone', 'HomeFax', 'WorkFax', 'OtherPhone', 'HomeEmail', 'WorkEmail', 'OtherEmail', 'Notes', 'Groups' ]
  const newFileLines = [ headers ]
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].split(',').map(s => s.replace(/"/g, ''))
    /* the original export has name_last, name_first, ..., email1, ... */
    const [ lastName, firstName, email ] = [ line[0], line[1], (line[20] || line[21] || line[22]) ]
    /* record is useless without an email address */
    if (email && email.indexOf('@') > -1) newFileLines.push([
      firstName,
      lastName,
      ...(new Array(33).fill('')),
      email,
      ...(new Array(4).fill(''))
    ])
  }
  return newFileLines
    .map(row => row.map(values => `${values}`.trim()).join(','))
    .join('\n')
}
