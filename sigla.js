/**
* Summary RISM sigla catalog.
* Description This JS is building html nodes from a RISM-SRU request.to sigla.
* @author: Stephan Hirsch
* @version: 0.1
*
*/

const nsMarc = "http://www.loc.gov/MARC21/slim";
const nsZing = "http://www.loc.gov/zing/srw/";
var results = document.querySelector('.siglaResultTables');
var records = [];
//Basic html template
var markup = `
      <div class="siglaQuery">
        <div class="siglaQuerySelect">
          <select id="siglaQuerySelect" name="advanced">
            <option value="">All fields</option>
            <option value="name:">Name</option>
            <option value="sigla:">Library Sigla</option>
            <option value="city:">City</option>
            <option value="country:">Country</option>             
          </select>
        </div>
        <div class="siglaQueryInput">
          <input id="siglaQueryInput">
        </div>
        <div class="siglaQuerySubmit">
          <input id="siglaQuerySubmit" type="submit" value="Search">
        </div>
      </div>
      <div class="siglaResultSize">RISM: Hits 1-20 of <span id="resultSize"></span> for <span id="queryTerm" class="queryTerm"></span>.</div>
      <div class="siglaResultTables"></div>
`
//Adding listeners
var addListeners = function(){
  document.querySelector("#siglaQuerySubmit").addEventListener("click", (e) => {
    search();
  });
  document.querySelector("#siglaQueryInput").addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      search();
    }} );
};

//Make an ajax request to SRU, build html and push records to results
var search = function(){
   var queryTerm = document.querySelector("#siglaQueryInput").value;
    var xhr = new XMLHttpRequest();

    // Ajax reuest to SRU  
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
          var record = buildRecord(marcRecords[i]);
          records.push(record);
        }
        createElements(records);
      }
      else {
        //FIXME show err at client
        console.log('The request failed!');
      }
      //outer
    };
    xhr.open('GET', `https://beta.rism.info/sru/institutions?operation=searchRetrieve&version=1.1&query=${queryTerm}%20AND%20librarySiglum=*-*&maximumRecords=20`);
    xhr.send();
}

//Function to add various div-tags to document.parent .siglaResultTables
var createElements = function(collection){
  var parent = document.querySelector('.siglaResultTables');
  while (parent.firstChild) {
    parent.firstChild.remove()
  }
  for (let i = 0; i < collection.length; i++) {
    record = collection[i];
    var div = 
      `<div id="${record.id}" onclick="showDetails(${record.id})" class="resultItem">${i+1}. ${record._110a}${record._110c ? ", " + record._110c : ""} 
        <div class="itemSigla">${record._110g}</div>
      </div>`
    var details = `
        <div id="details_${record.id}" class="itemDetails">
          ${record._043c ? `<p><span class="fieldName">Country: </span><span class="fieldValue">${countryCodes[record._043c]}</span></p>` : ""}
          ${record._371a ? `<p><span class="fieldName">Address: </span><span class="fieldValue">${record._371a}</span></p>` : ""}
          ${record._371u ? `<p><span class="fieldName">URL: </span><span class="fieldValue"><a href="${record._371u}" target="_blank">${record._371u}</a></span></p>` : ""}
      </div>`
    var element = new DOMParser().parseFromString(div, 'text/html');
    var details_element = new DOMParser().parseFromString(details, 'text/html');
    parent.append(element.body.firstElementChild);
    parent.append(details_element.body.firstElementChild);
   }
}

//Function to build a record object from marcxml-record
var buildRecord = function(xml) {
  var record = {};
  var fields = xml.children;
  for (let i = 0; i < fields.length; i++) {
    field = fields[i];
    if (field.getAttribute("tag") == "001") {
      record.id = field.innerHTML;
    }

    if (field.getAttribute("tag") == "043") {
      subfields = field.children;
      for (let i = 0; i < subfields.length; i++) {
        subfield = subfields[i];
        if (subfield.getAttribute("code") == "c") {
          record._043c = subfield.innerHTML;
        }
      }
    }
 
    if (field.getAttribute("tag") == "110") {
      subfields = field.children;
      for (let i = 0; i < subfields.length; i++) {
        subfield = subfields[i];
        if (subfield.getAttribute("code") == "a") {
          record._110a = subfield.innerHTML;
        }
        if (subfield.getAttribute("code") == "c") {
          record._110c = subfield.innerHTML;
        }
        if (subfield.getAttribute("code") == "g") {
          record._110g = subfield.innerHTML;
        }
      }
    }

    if (field.getAttribute("tag") == "371") {
      subfields = field.children;
      for (let i = 0; i < subfields.length; i++) {
        subfield = subfields[i];
        if (subfield.getAttribute("code") == "a") {
          record._371a = subfield.innerHTML;
        }
        if (subfield.getAttribute("code") == "u") {
          record._371u = subfield.innerHTML;
        }
      }
    }
  }
  return record;
}

// Toggle display of details
var showDetails = function(id){
  var details = document.getElementById(`details_${id}`);
  console.log(details.style.display);
  if (details.style.display === "none" || details.style.display === "") {
        details.style.display = "block";
  } else {
        details.style.display = "none";
  }
}

window.onload = function() {
  document.querySelector("#siglaCatalog").innerHTML = markup;
  addListeners();
}

var countryCodes = {'XA-DE': 'Germany', 'XA-FR': 'France'}









