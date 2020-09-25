var nsMarc = "http://www.loc.gov/MARC21/slim";
var nsZing = "http://www.loc.gov/zing/srw/";

document.querySelector("#siglaQuerySubmit").addEventListener("click", (e) => {
  var queryTerm = document.querySelector("#siglaQueryInput").value;

  console.log(queryTerm); 

  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      //console.log('success!', xhr.response);
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(xhr.response, "text/xml");
      var resultSize = xmlDoc.getElementsByTagNameNS(nsZing, "numberOfRecords")[0].innerHTML;
      document.querySelector("#queryTerm").innerHTML = queryTerm;
      document.querySelector("#resultSize").innerHTML = resultSize;
      var marcRecords = xmlDoc.getElementsByTagNameNS(nsMarc, "record");
      console.log(marcRecords);


    } else {
      console.log('The request failed!');
    }
    console.log('This always runs...');
  };

  xhr.open('GET', `https://beta.rism.info/sru/institutions?operation=searchRetrieve&version=1.1&query=${queryTerm}&maximumRecords=20`);
  xhr.send();

});
  
  
  
  
  
  
  
  
  
