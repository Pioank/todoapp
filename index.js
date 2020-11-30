// Create item ids
var id = 0
document.getElementById('bt1').disabled = true;
document.getElementById('bt1').style.backgroundColor="grey";
var username = document.getElementById("username").value;

// adding rows function the depends cmethod PUT or GET it sends or not in the DynamoDB
function addrowsn(text,cmethod,deadl) {
    // Element IDs
    var fid = "p" + id; // row id for tab1
    var nodeid = "n" + id; //
    var comprid = "cr" + id;
    var deadid = "d" + id; // deadline id
    var usernm = document.getElementById("username").value;
  
    // Sending data to Dynamodb
    if (cmethod === 'put') {
      putrow(usernm,text,deadl)
    };

    // Create new row with text from text box
    var para = document.createElement("tr");
    para.setAttribute("class","tabrows")
    para.setAttribute("id", fid);
    var tda = document.createElement("td");
    tda.setAttribute("id", nodeid);
    var node = document.createTextNode(text);
    para.appendChild(tda);
    tda.appendChild(node);
  
    var element = document.getElementById("tab1");
    element.appendChild(para);
  
    // Create new row with deadline date
    var deadlrow = document.getElementById(fid);
    var deadr = document.createElement("td");
    deadr.setAttribute("id", deadid);
    var nodet = document.createTextNode(deadl);
    deadlrow.appendChild(deadr);
    deadr.appendChild(nodet);
  
    // Creating Delete button per task 
    var btn = document.createElement("button");   // Create a <button> element
    var btnr = document.createElement("td");
    btn.innerHTML = "Delete";
    btn.setAttribute("class", "deletebutton");
    btn.addEventListener ("click", function() {
      var taskdbremove = document.getElementById(nodeid).innerText;
      var usernmdbremove = document.getElementById("username").value;
      deletetask(taskdbremove,usernmdbremove);
      document.getElementById(fid).remove();
      
    });

    var deletebut = document.getElementById(fid);
    deletebut.appendChild(btnr);
    btnr.appendChild(btn);

    // Creating Complete task button per task
    var btnc = document.createElement("button");   // Create a <button> element
    var btncr = document.createElement("td");
    btnc.innerHTML = "Done";
    btnc.setAttribute("class", "donebutton");
    btnc.addEventListener ("click", function() {
      var taskcomplete = document.getElementById(nodeid);
      var taskcompletetable = document.getElementById("tab2");
      var tabcompr = document.createElement("tr");
      tabcompr.setAttribute("class","tabcomprows");
      tabcompr.setAttribute("id", comprid);
      taskcompletetable.appendChild(tabcompr);
      tabcompr.appendChild(taskcomplete);
      var taskdbremove = document.getElementById(nodeid).innerText;
      var usernmdbremove = document.getElementById("username").value;
      deletetask(taskdbremove,usernmdbremove);
      document.getElementById(fid).remove();
    });

    var donebut = document.getElementById(fid);
    donebut.appendChild(btncr);
    btncr.appendChild(btnc);

    // Delete text in textbox
    document.getElementById("finput").value="";    
    id = id + 1
  }

// Button Add to the list
function myfuc() {  
  var text = (document.getElementById("finput").value).trim();
  var usnm = document.getElementById("username").value;
  var deadl = document.getElementById("deadline").value;
  var cmethod = 'put';
  
  if (text === "" || usnm === "" ) {
    message("error","Add a task and / or username to continue");
  }
  else { addrowsn(text,cmethod,deadl)}
}

// Reset list function
function myfuc2(msg) {
  var elements = document.getElementsByClassName("tabrows");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
  var elements = document.getElementsByClassName("tabcomprows");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
  if (msg !== 'hidem'){
  message("success","The table has been cleared - You can load it again by clicking the button under the username entry field")};
}

// By pressing enter you can add new tasks when typing in textbox
document.getElementById("finput").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("bt1").click();
    }
})

// Call tasks from DynamoDB by username API CALL GET
function loadtasks() {
  var msg = "hidem";
  myfuc2(msg);
  var cmethod = 'get';
  username = document.getElementById("username").value;
  if (username === '') {
    document.getElementById('bt1').disabled = false;
    message("error","Please add a username");
  }else {
        document.getElementById('bt1').disabled = false;
  };
  fetch('https://ausndvnrb7.execute-api.eu-west-2.amazonaws.com/api/getdata/'+ username , {method: 'GET'}) 
    .then(
      function(response) { 
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
        // Examine the text in the response
        response.json().then(function(data) {
          if (data.Count === 0){
             message("error","It looks like there are no tasks under that username. Please proceed to add some");     document.getElementById('bt1').disabled = false;
            document.getElementById('bt1').style.backgroundColor="#4CAF50";
          } else {
           var notasks = data.Count
           message("success","There are " + notasks + " in your list");
           document.getElementById('bt1').disabled = false;
           document.getElementById('bt1').style.backgroundColor="#4CAF50";
           var val = data.Items;
           val.sort(function(a, b) {return a.deadline.localeCompare(b.deadline);});
           for (x in val) {
             var row = data.Items[x];
             console.log(row['task']);
             var usernm = row['task'];
             var deadl = row['deadline']; // Deadline
             addrowsn(usernm,cmethod, deadl);
           }
          };
        });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
}

// Delete button - API CALL DELETE
function deletetask(taskdbremove,usernmdbremove){
var obj = {'task-username':taskdbremove + usernmdbremove, 'username':usernmdbremove};
var myJSON = JSON.stringify(obj);
console.log(myJSON)
fetch('https://ausndvnrb7.execute-api.eu-west-2.amazonaws.com/api/deletedata/'+ myJSON, {method: 'DELETE'}) 
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      // Examine the text in the response
      response.json().then(function(data) {
      console.log(data);
      message("success","Task deleted");
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
}
  
// Add task - API CALL PUT
function putrow(name,task,deadl){
  var key = task + name;
  var obj = {"task-username": key, "username": name, "task": task, "deadline":deadl};
  var myJSON = JSON.stringify(obj);
  console.log(myJSON)
  fetch('https://ausndvnrb7.execute-api.eu-west-2.amazonaws.com/api/recorddata/'+ myJSON , {method: 'PUT'}) 
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
        // Examine the text in the response
        response.json().then(function(data) {
          console.log(data)
        });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
} 

// Pass success or error messages on a p 
function message(csss,mess) {
    document.getElementById("messageb").classList.add(csss);
    document.getElementById("messageb").innerText = mess;
    setTimeout(function(){document.getElementById("messageb").innerText="";}, 2000); 
};