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
var startRecord = 1;
var query = {term: '*-*', offset: 1};
var sruhost = "";
var limit = 10;

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
      <div class="siglaResultSize">RISM: Hits <span id="firstPosition"></span>-<span id="lastPosition"></span> of <span id="resultSize"></span> for <span id="queryTerm" class="queryTerm"></span>.</div>
      <div class="siglaResultTables"></div>
      <div id="siglaPager" class="siglaPager"></div>
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

var buildQueryString = function(obj){
  term = obj.term;
  startRecord = obj.offset;
  queryString = `${sruhost}/sru/institutions?operation=searchRetrieve&version=1.1&query=${term}%20AND%20librarySiglum=*-*&maximumRecords=${limit}&startRecord=${startRecord}`;
  return queryString;
}

//Make an ajax request to SRU, build html and push records to results
var search = function(offset=1){
  query.term = document.querySelector("#siglaQueryInput").value;
  var xhr = new XMLHttpRequest();

    // Ajax reuest to SRU  
    xhr.onload = function () {
      records = [];
      if (xhr.status >= 200 && xhr.status < 300) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xhr.response, "text/xml");
        var resultSize = xmlDoc.getElementsByTagNameNS(nsZing, "numberOfRecords")[0].innerHTML;
        document.querySelector("#queryTerm").innerHTML = query.term;
        document.querySelector("#resultSize").innerHTML = resultSize;
        document.querySelector(".siglaResultSize").style.display = 'block';
        var zingRecords = xmlDoc.getElementsByTagNameNS(nsZing, "record");
        for (let i = 0; i < zingRecords.length; i++) {
          var record = buildRecord(zingRecords[i]);
          records.push(record);
        }
        document.querySelector("#firstPosition").innerHTML = records[0].position;
        document.querySelector("#lastPosition").innerHTML = records.slice(-1)[0].position;
        createElements(records);
        buildPager(resultSize);
      }
      else {
        //FIXME show err at client
        console.log('The request failed!');
      }
      //outer
    };
    query.offset = offset;
    q = buildQueryString(query);
    console.log(q);
    xhr.open('GET', q);
    //xhr.open('GET', `https://beta.rism.info/sru/institutions?operation=searchRetrieve&version=1.1&query=${queryTerm}%20AND%20librarySiglum=*-*&maximumRecords=20&startRecord=${startRecord}`);
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
      `<div id="${record.id}" onclick="showDetails(${record.id})" class="resultItem">${record.position}. ${record._110a}${record._110c ? ", " + record._110c : ""} 
        <div class="itemSigla">${record._110g}</div>
      </div>`
    var details = `
        <div id="details_${record.id}" class="itemDetails">
          <b>Information:</b>
          ${record._043c ? `<div><span class="fieldName">Country: </span><span class="fieldValue">${countryCodes[record._043c]}</span></div>` : ""}
          ${record._371a ? `<div><span class="fieldName">Address: </span><span class="fieldValue">${record._371a}</span></div>` : ""}
          ${record._371u ? `<div><span class="fieldName">URL: </span><span class="fieldValue"><a href="${record._371u}" target="_blank">${record._371u}</a></span></div>` : ""}
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
  record.position = xml.getElementsByTagNameNS(nsZing, "recordPosition")[0].innerHTML;
  var marc = xml.getElementsByTagNameNS(nsMarc, "record")[0];
  var fields = marc.children;
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
  if (details.style.display === "none" || details.style.display === "") {
        details.style.display = "block";
  } else {
        details.style.display = "none";
  }
}

window.onload = function() {
  document.querySelector("#siglaCatalog").innerHTML = markup;
  limit = parseInt(document.querySelector("#siglaCatalog").getAttribute("limit"));
  sruhost = document.querySelector("#siglaCatalog").getAttribute("sruhost");
  addListeners();
}

var buildPager = function(resultSize){
  size = parseInt(resultSize) + limit;
  res = [];
  for (let i = 1; i < size; i++) {
    if (i % limit == 0) {
      res.push(`<span class="pagerItem" onClick="search(${i - (limit - 1)})">${i / limit }</span>   `)
    }  
  }
  document.getElementById(`siglaPager`).innerHTML = res.join("");

}

var countryCodes = {'XA-DE': 'Germany', 'XA-FR': 'France'}









