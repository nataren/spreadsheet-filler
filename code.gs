/*
Copyright (c) 2017 Cesar Lopez-Nataren

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function onSubmitForm(ev) {
  var nowMs = Date.now();

  var theForm = ev.source;
  Logger.log("formname=%s", theForm.getTitle());

  var theResponse = ev.response;
  
  // Get the address
  var addressItem;
  var paragraphItems = theForm.getItems(FormApp.ItemType.PARAGRAPH_TEXT);
  for(var i = 0; i < paragraphItems.length; i++) {
    var item = paragraphItems[i];
    var title = item.getTitle();
    Logger.log("title=%s, type=%s", title, typeof(title));
    if(title.match(/direcci/gi)) {
      addressItem = item;
      break;
    }
  }
  var addressResponse = theResponse.getResponseForItem(addressItem);
  Logger.log("addressresponse=%s", addressResponse.getResponse());
             
  var geoInfo =
      Maps
        .newGeocoder()
        .setRegion("mx")
        .setLanguage("es")
        .setBounds(17.6360, -101.0384, 21.2292, -97.2280)
        .geocode(addressResponse.getResponse());
  
  var lat, lng;
  if(geoInfo.results && geoInfo.results.length > 0) {
    var result = geoInfo.results[0];
    lat = result.geometry.location.lat;
    lng = result.geometry.location.lng;
  }
             
  // Get all the form's fields
  var responses = theResponse.getItemResponses();
  var EXTRA = 4;
  var spItems = new Array(EXTRA + responses.length);
  
  spItems[0] = lat + "/" + lng;
  
  var tz = Session.getScriptTimeZone();
  var now = new Date(nowMs)
  spItems[1] = now.toLocaleDateString("es-mx");
  spItems[2] = now.toLocaleTimeString("es-mx")
  spItems[3] = now.toUTCString();
  
  for(i = 0, j = EXTRA; i < responses.length; i++, j++) {
    spItems[j] = responses[i].getResponse();
  }
  
  // Get the Spreadsheet
  // Testing
  // var theSheet = SpreadsheetApp.openById("{TESTING_SPREADSHEET_ID}");
  
  // Production
  var theSheet = SpreadsheetApp.openById("{PRODUCTION_SPREADSHEET_ID}");
  Logger.log("sheet=%s", theSheet.getName());  
    
  // Insert row to the spreadsheet
  Logger.log(spItems);
  theSheet.appendRow(spItems);
  Logger.log("appended row to spreadsheet");
}
