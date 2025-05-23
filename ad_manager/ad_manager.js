/*************************************************************
  ad_manager.js

  Written by Mr Bob, Term 1 2020
  Develop a basic W3.CSS interface.
    v1 Basic layout of landing & game pages.
    v2 Landing/games pages full screen height but only display
       landing page on start up.
    v3 Stop canvas being displayed until its wanted.
    v4 Divide pages into left hand (1/3 of page) & 
       right hand (2/3 page) divs. 
       Also provide a margin at the bottom of pages.
    v5 Add button to landing page which hides the landing page
       and displays game page.
    v6 Add START button and score paragraphs etc to game page 
       left hand div (user control panel).
    v7 Make START button toggle between START and STOP button. 
    v8 Add bouncing balls when START button clicked.
    v9 Add reSize canvas.
    v10 Make font size responsive by using em instead of px.
    v11 Add firebase
    v12 Add admin with fixed table update
    v13 Add numeric validation
    v14 Add further comments
    v15 Modify to accept path as 1st param from readAll & 
        add class to button to set colour grey
    v16 Modify to use admin.html page & session storage
    v17 Alter _dbRec to _snapshot & alter order of function params
        on functions to process firebase readAll
    v18 DID NOT implement v18 change of COL_ to C_
    v19 Modify readAll input parameters to include _save &
        result for compatibility with student code.
    v20 Insert null as 2nd paramter to fb_readAll calls &
        use console.log instead of logIt function
    v21 Fix code comments.
    v22 Replace DB button with BB button to stop confusion
*************************************************************/

/*************************************************************          //<=====
  TO IMPLIMENT THE ADMIN FEATURE:                                       //<=====
    1. Copy the ad_manager.css into your project.                       //<=====
    2. Copy the ad_manager.html into your project.                      //<=====
    3. Create an ad_manger.js module in your project &                  //<=====
         copy the contents of this file into it.                        //<=====
    4. Taylor your ad_manger.js to fit your program code by looking     //<=====
         at lines ending with  //<=======                               //<=====
    5. NOTE: I make use of contants BB & SI to hold the paths of my     //<=====
        firebase scores. EG: const BB = 'scores/BB'                     //<=====
    6. DO NOT ALTER ANYTHING BELOW THE COMMENT LINE                     //<=====
        "YOU SHOULD NOT ALTER ANY OF THE CODE BELOW"                    //<=====
*************************************************************/          //<=====
const COLAD_C = 'black';
const COLAD_B = '#F0E68C';
console.log('%c ad_manager.js \n--------------------',
            'color: blue; background-color: white;');

/**************************************************************/
// ad_load()
// Called by ad_manager.html onload
// Place any code you need to run once on page load here
// Input:  n/a
// Return: n/a
/**************************************************************/
function ad_load() {
  console.log('%c ad_load(): ',
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');
  // WANT TO DISPLAY USER'S PHOTO? THEN MAKE SURE THE NAME IS CORRECT   //<=====
  //img_photoURL.src = userDetails.photoURL;                            //<=====
  ad_user();
}

/**************************************************************/
// ad_user()
// Input event; called by ad_admin and when admin's USER button clicked.
// Display user screen
// Input:  n/a
// Return: n/a
/**************************************************************/
function ad_user() {
  console.log('%c ad_user(): ',
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  ad_alterClass('ad_btn', 'grey');
  document.getElementById("b_adUser").style.backgroundColor = "cyan";
  // ENSURE THE READ FUNCTION NAME & THE PATH NAME ARE CORRECT          //<=====
  fb_readUserDetailsAdmin('userDetails', null, ad_processUSERReadAll);                     //<=====
}

/**************************************************************/
// ad_BB()
// Input event; called when admin's BB (Bouncing Balls) button clicked
// Display BB admin screen
// Input:  n/a
// Return: n/a
/**************************************************************/
function ad_BB() {
  console.log('%c ad_BB(): ',
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  ad_alterClass('ad_btn', 'grey');
  document.getElementById("b_adBB").style.backgroundColor = "cyan";
  // ENSURE THE READ FUNCTION NAME & THE PATH NAME ARE CORRECT          //<=====
  fb_readUserGeoDashScoresAdmin('geoDash', null, ad_processBBReadAll);                            //<=====
}

/**************************************************************/
// ad_SI()
// Input event; called when admin's SI (space Invaders) button clicked
// Display SI admin screen
// Input:  n/a
// Return: n/a
/**************************************************************/
function ad_SI() {
  console.log('%c ad_SI(): ',
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  ad_alterClass('ad_btn', 'grey');
  document.getElementById("b_adSI").style.backgroundColor = "cyan";
  // ENSURE THE READ FUNCTION NAME & THE PATH NAME ARE CORRECT          //<=====
  fb_readUserRocketRushScoresAdmin('rocketRush', null, ad_processSIReadAll);                            //<=====
}

/**************************************************************/
// ad_processUSERReadAll(_result, _path,  _snapshot, _save, _error)
// Called by fb_readAll to handle result of read ALL USER records request.
// Save data & update display with record info
// Input:  result('waiting...', 'OK', 'error'), path, 
//         snapshot, where to save it & error msg if any
//         NOTE: This is the raw data, EG snapshot, and
//                NOT the output from snapshot.val()
// Return: n/a
/**************************************************************/
//                   _procFunc(_result, _path,  _snapshot, _save, _error)
function ad_processUSERReadAll(_result, _path, _snapshot, _save, _error) {
  console.log('%c ad_processUSERReadAll', 'result= ' + _result,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  // Note: if read was successful, _result  must = "OK"                 //<=====
  if (_result != 'OK') {
    console.error('Database read error for ' + _path + '\n' + _error);
    alert('Database read error; see console log for details');
    return;
  }

  var childKey;
  var childData;
  var ad_adminArray = [];

  if (_snapshot.val() != null) {
    _snapshot.forEach(function(childSnapshot) {
      childKey = childSnapshot.key;
      childData = childSnapshot.val();

      // ENSURE THE FEILDS YOU PUSH INTO THE ARRAY OF OBJECTS           //<=====
      //  MATCH YOUR FIREBASE RECORDS FOR THE PATH                      //<=====
      ad_adminArray.push({
        displayName: childData.displayName,
        email: childData.email,
        // Left photoURL out ==> so long the table will be too wide for screen
        //photoURL:   childData.photoURL,  
        gameName: childData.gameName,
        age: childData.age,
        uid: childKey
        //   more fields ????
      });
    });
  } else {
    console.log('%c ad_processUSERReadAll(): no records',
                'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');
  }

  // build & display user data
  // MAKE SURE THE FOLOWING PARAMETERS ARE CORRECT. PARAMETER:          //<=====
  //  7 = COLUMMN NUMBER WHICH CONTAINS THE DATABASE KEY.               //<=====
  //  8 = DATABASE PATH THE RECORDS WERE READ FROM.                     //<=====
  ad_displayAll("t_userData", ad_adminArray, true, "", "", "",
    5, 'userDetails');                                                        //<=====
}

/**************************************************************/
// ad_processBBReadAll(_result, _path,  _snapshot, _save, _error)
// Called by fb_readAll to handle result of read ALL BB records request.
// Save data & update display with record info
// Input:  result('waiting...', 'OK', 'error'), path, 
//         snapshot, where to save it & error msg if any
//         NOTE: This is the raw data, EG snapshot, and
//                NOT the output from snapshot.val()
// Return: n/a
/**************************************************************/
//                 _procFunc(_result, _path, _snapshot, _save, _error)
function ad_processBBReadAll(_result, _path, _snapshot, _save, _error) {
  console.log('%c ad_processBBReadAll(): result= ' + _result,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  // Note: if read was successful, _result  must = "OK"                 //<=====
  if (_result != 'OK') {
    console.error('Database read error for ' + _path + '\n' + _error);
    alert('Database read error; see console log for details');
    return;
  }

  var childKey;
  var childData;
  var ad_adminArray = [];

  if (_snapshot.val() != null) {
    _snapshot.forEach(function(childSnapshot) {
      childKey = childSnapshot.key;
      childData = childSnapshot.val();
      console.log(Object.keys(childData));

      // ENSURE THE FEILDS YOU PUSH INTO THE ARRAY OF OBJECTS           //<=====
      //  MATCH YOUR FIREBASE RECORDS FOR THE PATH                      //<=====
      ad_adminArray.push({
        uid: childData.uid,
        gameName: childKey,
        score: childData.score
        //   more fields ????
      });
    });
  } else {
    console.log('%c ad_processBBReadAll(): no records',
                'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');
  }

  // build & display user data
  // MAKE SURE THE FOLOWING PARAMETERS ARE CORRECT. PARAMETER:          //<=====
  //  7 = COLUMMN NUMBER WHICH CONTAINS THE DATABASE KEY.               //<=====
  //  8 = DATABASE PATH THE RECORDS WERE READ FROM.                     //<=====
  ad_displayAll("t_userData", ad_adminArray, true, "", "", "",
    1, 'geoDash');                                                             //<=====
}

/**************************************************************/
// ad_processSIReadAll(_result, _path,  _snapshot, _save, _error)
// Called by fb_readAll to handle result of read ALL SI records request.
// Save data & update display with record info
// Input:  result('waiting...', 'OK', 'error'), path, 
//         snapshot, where to save it & error msg if any
//         NOTE: This is the raw data, EG snapshot, and
//                NOT the output from snapshot.val()
// Return: n/a
/**************************************************************/
//                 _procFunc(_result, _path, _snapshot, _save, _error)
function ad_processSIReadAll(_result, _path, _snapshot, _save, _error) {
  console.log('%c ad_processSIReadAll(): result= ' + _result,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  // Note: if read was successful, _result  must = "OK"                 //<=====
  if (_result != 'OK') {
    console.error('Database read error for ' + _path + '\n' + _error);
    alert('Database read error; see console log for details');
    return;
  }

  var childKey;
  var childData;
  var ad_adminArray = [];

  if (_snapshot.val() != null) {
    _snapshot.forEach(function(childSnapshot) {
      childKey = childSnapshot.key;
      childData = childSnapshot.val();
      console.log(Object.keys(childData));

      // ENSURE THE FEILDS YOU PUSH INTO THE ARRAY OF OBJECTS           //<=====
      //  MATCH YOUR FIREBASE RECORDS FOR THE PATH                      //<=====
      ad_adminArray.push({
        uid: childData.uid,
        gameName: childKey,
        score: childData.score
        //   more fields ????
      });
    });
  } else {
    console.log('%c ad_processSIReadAll(): no records',
                'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');
  }

  // build & display user data
  // MAKE SURE THE FOLOWING PARAMETERS ARE CORRECT. PARAMETER:          //<=====
  //  7 = COLUMMN NUMBER WHICH CONTAINS THE DATABASE KEY.               //<=====
  //  8 = DATABASE PATH THE RECORDS WERE READ FROM.                     //<=====
  ad_displayAll("t_userData", ad_adminArray, true, "", "", "",
    1, '`rocketRush`');                                                             //<=====
}

/**************************************************************/
// ad_userInput(_feildName, _data)
// Called by finishTdEdit
// Validate numeric data & convert string number input to numerics
// Input:  field and user input
// Return: if validation ok: [true, numeric user input] else: [false, user input]
/**************************************************************/
function ad_userInput(_feildName, _data) {
  console.log('%c ad_userInput(): _feildName = ' + _feildName +
              ',  _data = ' + _data,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  // Set up data types; 'a' for aplhabetic,   'n' for numeric  &  'b' for both
  // ENSURE THE FEILDS BELOW MATCH YOUR firebase FILEDS                 //<=====
  //   AND THE DATATYPE IS CORRECTLY SET                                //<=====
  var vd_dataTypes = {
    displayName: 'a',
    email: 'b',
    // Left photoURL out - its so long the table will be too wide for screen
    //photoURL:   'b', 
    gameName: 'b',
    phone: 'n',
    age: 'n',
    sex: 'a',
    addrNum: 'n',
    uid: 'b',

    gameName: 'b',
    wins: 'n',
    losses: 'n',
    hits: 'n',
    lives: 'n',
    time: 'n'
  };

  if (vd_dataTypes[_feildName] == 'n') {
    temp = Number(_data);
    if (isNaN(temp)) {
      return [false, _data];
    }
    return [true, temp];
  }

  else {
    return [true, _data];
  }
}

//==============================================================================
//==============================================================================
//        YOU SHOULD NOT ALTER ANY OF THE CODE BELOW                    //<=====
//==============================================================================
//==============================================================================

/**************************************************************/
// ad_alterClass(_class, _colour)
// Called by various
// Alter classes colour
// Input:  html class to act on & the colour to set it to
// Return: n/a
/**************************************************************/
function ad_alterClass(_class, _colour) {
  console.log('%c ad_alterClass(): class= ' + _class +
              ' / colour= ' + _colour,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  var element = document.getElementsByClassName(_class);
  for (i = 0; i < element.length; i++) {
    element[i].style.backgroundColor = _colour;
  }
}

/**************************************************************/
// ad_displayAll(_tableId, _array, _action, _hideId, _showId, _path)
// Called by ad_dbRAllUResult & ad_dbRAllBBResult
// Display all user records screen:
//    1. optionaly hide other screen & display the admin screen.
//    2. empty the html table.
//    3. dyanmicaly build html table & display all records. 
// Input:  1. html table id to dynamicaly build and populate.
//         2. data (an array of objects) to add to the table.
//         3. add DELETE & MODIFY capability to the table (true OR false).
//         4. to hide the previous screen, supply the html ids
//           of the associated divs to hide it OR leave them empty ''
//         5. to show the admin screen, supply the html id
//           of the associated div to show it OR leave empty ''
//         6. table item number containing the db key.
//         7. firebase path for delete capability.
// Return: n/a
//
// V01: Initial version
// v02: Add delete & update code
//
// Example call of ad_displayAll:
//  ad_displayAll("t_userData", dbArray, true, "landingPage", "", "adminPage", 
//                1, DETAILS);
/**************************************************************/
function ad_displayAll(_tableId, _array, _action, _hideId1, _hideId2,
                       _showId, _item, _path) {
  console.log('%c ad_displayAll(): ',
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  // Optionaly hide html divs and show another html div
  if (_hideId1 != null && _hideId1 != "") {
    document.getElementById(_hideId1).style.display = "none";
  }
  if (_hideId2 != null && _hideId2 != "") {
    document.getElementById(_hideId2).style.display = "none";
  }
  if (_showId != null && _showId != "") {
    document.getElementById(_showId).style.display = "block";
  }

  // Ensure the html table is empty before we start
  if (document.getElementById(_tableId).rows.length > 0) {
    document.getElementById(_tableId).innerHTML = "";
  }

  var tableInfo = document.getElementById(_tableId); //Get info on target table

  if (_array.length > 0) { // Only if there is data
    var fieldNames = Object.keys(_array[0]); //Get header from 1st entry 

    /******************************************/  //DIAG
    console.log('--------------------------');    //DIAG
    console.log('_array[0]: ');                   //DIAG
    console.log(_array[0]);                       //DIAG
    console.log('fieldNames= ' + fieldNames);     //DIAG
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^');    //DIAG
    /******************************************/  //DIAG

    // Dynamically build html table & display the data
    ad_genTableEntry(tableInfo, _array, _action, _tableId, _item, _path);
    ad_genTableHead(tableInfo, fieldNames, _action);

    ad_clickEditCell(_tableId, _item, _path); // Make cells editable
  }
}

/**************************************************************/
// ad_genTableHead(_tableInfo, _fieldNames, _action)
// Called by ad_BB
// Create table header
// Input:  table & object array of data 
//         if _action = true, then add action column
// Return: n/a
/**************************************************************/
function ad_genTableHead(_tableInfo, _fieldNames, _action) {
  console.log('%c ad_genTableHead(): ',
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  let thead = _tableInfo.createTHead();
  let row = thead.insertRow();

  // Optionaly create ACTION header
  if (_action != null && _action != "") {
    let th = document.createElement("th");
    let text = document.createTextNode("action");
    th.appendChild(text);
    row.appendChild(th);
  }

  // Loop thru array of object's field names creating header for entry each
  for (let key of _fieldNames) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

/**************************************************************/
// ad_genTableEntry(_tableInfo, _array, _action, _tableId, _item, _path)
// Called by ad_BB
// Create table entries
// Input:  table & object array of data
//         if _action = true, then add DELETE button
//         table id & table item number containing db key
//         db path
// Return: n/a
/**************************************************************/
function ad_genTableEntry(_tableInfo, _array, _action, _tableId, _item, _path) {
  console.log('%c ad_genTableEntry(): ',
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  // Loop thru array of object's data creating cell for entry each
  for (let element of _array) {
    let row = _tableInfo.insertRow();
    // Optionaly create ACTION cell
    if (_action != null && _action != "") {
      // add a button control.
      var button = document.createElement('input');

      // set the attributes.
      button.setAttribute('type', 'button');
      button.setAttribute('value', 'Delete');

      // add button's "onclick" event.         
      button.addEventListener("click", function() {
        ad_dbDelRec(_tableId, this, _item, _path);
      });
      let cell = row.insertCell();
      cell.appendChild(button);
    }

    for (key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}

/**************************************************************/
// ad_clickEditCell(_tableId _item, _path)
// Called by user clicking on a table's cell
// Edit the cell's data except for cell 0.
// Input:  table id
// Return: n/a
/**************************************************************/
function ad_clickEditCell(_tableId, _item, _path) {
  console.log('%c ad_clickEditCell(): path = ' + _path +
              ', item = ' + _item,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  let table = document.getElementById(_tableId);
  let editingTd;
  var cell;
  var row;
  var dbKey;
  var dbFieldName;

  //document.querySelector("table").addEventListener("click", function(event) {
  table.onclick = function(event) {
    //console.log('%c ad_clickEditCell', 'click event called. path = ' +
    //  _path, 'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';'); 
    // 4 possible targets:                
    let target = event.target.closest('.edit-cancel,.edit-ok,td');

    if (!table.contains(target)) return;

    if (target.className == 'edit-cancel') {
      finishTdEdit(editingTd.elem, false);
    } else if (target.className == 'edit-ok') {
      finishTdEdit(editingTd.elem, true, _path, dbKey, dbFieldName);
    } else if (target.nodeName == 'TD') {
      if (editingTd) return; // already editing
      if (typeof event.target.cellIndex == 'undefined') return;

      cell = event.target.cellIndex;
      row = target.parentNode.rowIndex;
      dbKey = table.rows[row].cells[_item].innerHTML;
      dbFieldName = table.rows[0].cells[cell].innerHTML;

      makeTdEditable(target);
    }
  }

  function makeTdEditable(td) {
    editingTd = {
      elem: td,
      data: td.innerHTML
    };

    td.classList.add('edit-td'); // td is in edit state, CSS also styles area inside

    let textArea = document.createElement('textarea');
    textArea.style.width = td.clientWidth + 'px';
    textArea.style.height = td.clientHeight + 'px';
    textArea.className = 'edit-area';

    textArea.value = td.innerHTML;
    td.innerHTML = '';
    td.appendChild(textArea);
    textArea.focus();

    td.insertAdjacentHTML("beforeEnd",
      '<div class="edit-controls"><button class="edit-ok">OK' +
      '</button><button class="edit-cancel">CANCEL</button></div>'
    );
  }

  function finishTdEdit(td, isOk, _path, _dbKey, _dbFieldName) {
    if (isOk) {
      td.innerHTML = td.firstChild.value;
      console.log('%c finishTdEdit(): path/key = ' + _path + '/' +
        _dbKey + ',  field name = ' + _dbFieldName +
        ', data = ' + td.innerHTML,
        'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

      var data = {};
      var rtn = [];
      rtn = ad_userInput(_dbFieldName, td.innerHTML);
      if (rtn[0]) {        // User input validated ok?
        data[_dbFieldName] = rtn[1];
        console.log('%c finishTdEdit(): td.innerHTML = ' + rtn[1] +
                    '  type = ' + typeof (rtn[1]),
                    'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

        td.style.background = 'red';
        ad_dbUpdateRec(_path, _dbKey, _dbFieldName, data, td);
      }
      else {               // User input failed validation
        td.style.background = 'red';
        console.error('finishTdEdit(): validation failed for ' + rtn[1] +
                      '  type = ' + typeof (rtn[1]));
        alert('Database validation error; see console log for details');
      }
    }
    else {
      td.innerHTML = editingTd.data;
    }
    td.classList.remove('edit-td');
    editingTd = null;
  }
}

/**************************************************************/
// ad_dbUpdateRec(_tableId, _row, _item, _path)
// Called by finishTdEdit when user clicks OK button
// Update the associated record from firebase
// Input:  path, key, field name, data & td object
// Return: n/a
/**************************************************************/
function ad_dbUpdateRec(_path, _dbKey, _dbFieldName, _data, _td) {
  console.log('%c ad_dbUpdateRec(): _path/_dbKey = ' + _path + '/' +
              _dbKey + ',  _dbFieldName = ' + _dbFieldName +
              ',  _data = ' + _data + '  _td = ' + _td,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  var dbRef = firebase.database().ref(_path + '/' + _dbKey);
  dbRef.update(_data).then(function() {
    _td.style.background = 'Azure';
    console.log('%c ad_dbUpdateRec(): Update succeeded for ' +
                _path + '/' + _dbKey,
                'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');
    //ad_delRow(_tableId, _row, item, _path);
  })
    .catch(function(error) {
      console.error('ad_dbUpdateRec(): Update failed for ' + _path +
                    '/' + _dbKey + ': ' + error.message);
      alert('Database write error; see console log for details');
    });
}

/**************************************************************/
// ad_dbDelRec(_tableId, _row, _item, _path)
// Called when user clicks DELETE button
// Delete the associated record from firebase
// Input:  html table id, row & item number of firebase key and firebase path 
// Return: n/a
/**************************************************************/
function ad_dbDelRec(_tableId, _row, _item, _path) {
  console.log('%c ad_dbDelRec(): _tableId/_row = ' + _tableId + '/' + _row +
              ',  _item = ' + _item + ',  _path = ' + _path,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  var i = _row.parentNode.parentNode.rowIndex;
  var key = document.getElementById(_tableId).rows[i].cells.item(_item).innerHTML;
  console.log('%c ad_dbDelRec(): db path/key = ' + _path + '/' + key,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  var dbRef = firebase.database().ref(_path + '/' + key);
  dbRef.remove().then(function() {
    console.log('%c ad_dbDelRec(): Remove succeeded for ' + _path + '/' + key,
                'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');
    ad_delRow(_tableId, _row);
  })
    .catch(function(error) {
      console.error('ad_dbDelRec(): Remove failed for ' + _path + '/' +
                    key + ': ' + error.message);
      alert('Database delete error; see console log for details');
    });
}

/**************************************************************/
// ad_delRow(_tableId, _row)
// Called by ad_dbDelRec when user clicks DELETE button
// Delete a row from a table
// Input:  table id & row to delete
// Return:
/**************************************************************/
function ad_delRow(_tableId, _row) {
  console.log('%c ad_delRow(): _tableId/_row = ' + _tableId + '/' + _row,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  var i = _row.parentNode.parentNode.rowIndex;
  console.log('%c ad_delRow(): i = ' + i,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');
  document.getElementById(_tableId).deleteRow(i);
}

/**************************************************************/
// ad_enterEvent(_tableId)
// Called by user entering data in a table's cell
// Display the cell's data
// Input:  table id
// Return: n/a
/**************************************************************/
function ad_enterEvent(_tableId) {
  console.log('%c ad_enterEvent(): _tableId = ' + _tableId,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  // Listen for typing into a cell - display what is being typed into the cell.
  document.getElementById(_tableId).addEventListener("input", function(event) {
    var td = event.target;
    while (td !== this && !td.matches("td")) {
      td = td.parentNode;
    }

    if (td === this) {
      console.log('%c ad_dbRAllUResult(): enter - No table cell found',
                  'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');
    } else {
      console.log('%c ad_dbRAllUResult(): enter - cell= ' + td.innerHTML,
                  'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

      if (td.innerHTML == 'd') {
        //document.getElementById(_tableId).deleteRow(2);
      }
    }
  });
}

/**************************************************************/
// ad_clickCell(_tableId)
// Called by user clicking on a table's cell
// Edit the cell's data
// Input:  table id
// Return: n/a
/**************************************************************/
function ad_clickCell(_tableId) {
  console.log('%c ad_clickCell(): _tableId = ' + _tableId,
              'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');

  // Click on cell to display its contents
  document.querySelector("table").addEventListener("click", function(event) {
    var td = event.target;
    while (td !== this && !td.matches("td")) {
      td = td.parentNode;
    }
    if (td === this) {
      console.log('%c ad_dbRAllUResult(): click - No table cell found',
                  'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');
    } else {
      console.log('%c ad_dbRAllUResult(): click - cell= ' + td.innerHTML,
                  'color: ' + COLAD_C + '; background-color: ' + COLAD_B + ';');
    }
  });
}

/**************************************************************/
//  END OF APP
/**************************************************************/