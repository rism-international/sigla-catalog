const nsMarc = "http://www.loc.gov/MARC21/slim";
const nsZing = "http://www.loc.gov/zing/srw/";
var results = document.querySelector('.siglaResultTables');
var records = [];

document.querySelector("#siglaQuerySubmit").addEventListener("click", (e) => {
  var queryTerm = document.querySelector("#siglaQueryInput").value;
  var xhr = new XMLHttpRequest();
  
  xhr.onload = function () {
    records = [];
    if (xhr.status >= 200 && xhr.status < 300) {
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(xhr.response, "text/xml");
      var resultSize = xmlDoc.getElementsByTagNameNS(nsZing, "numberOfRecords")[0].innerHTML;
      document.querySelector("#queryTerm").innerHTML = queryTerm;
      document.querySelector("#resultSize").innerHTML = resultSize;
      document.querySelector(".siglaResultSize").style.display = 'block';
      var marcRecords = xmlDoc.getElementsByTagNameNS(nsMarc, "record");
      for (let i = 0; i < marcRecords.length; i++) {
        var record = {};
        var marcRecord = marcRecords[i];
        var fields = marcRecord.children;
        for (let i = 0; i < fields.length; i++) {
          field = fields[i];
          if (field.getAttribute("tag") == "001") {
            record.id = field.innerHTML;
          }
          if (field.getAttribute("tag") == "110") {
            subfields = field.children;
            for (let i = 0; i < subfields.length; i++) {
              subfield = subfields[i];
              if (subfield.getAttribute("code") == "a") {
                record._110a = subfield.innerHTML;
              }
              if (subfield.getAttribute("code") == "g") {
                record._110g = subfield.innerHTML;
              }
            }
          }
        }
        records.push(record);
      }
      //console.log(records);
      putsMarc(records);
    }
    else {
      console.log('The request failed!');
    }
    //console.log('This always runs...');
  };

  xhr.open('GET', `https://beta.rism.info/sru/institutions?operation=searchRetrieve&version=1.1&query=${queryTerm}&maximumRecords=20`);
  xhr.send();

  var putsMarc = function(collection){
    var parent = document.querySelector('.siglaResultTables');
    while (parent.firstChild) {
      parent.firstChild.remove()

    }
    for (let i = 0; i < collection.length; i++) {
      record = collection[i];
      var div = document.createElement('div');
      div.classList.add('resultItem');
      div.innerHTML = `${i + 1 }. ${record._110a}`;
      var sigla = document.createElement('div');
      sigla.innerHTML = `(${record._110g})`;
      sigla.classList.add('itemSigla');
      div.appendChild(sigla);
      parent.appendChild(div);
    }

  }
});
  
  
  
  
  
  
  
  
  
