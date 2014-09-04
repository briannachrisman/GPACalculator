var text ="parsing";

document.addEventListener('DOMContentLoaded', function() {
    var button = document.getElementById('getClasses');
    var gpa;
    button.addEventListener('click', function() {
	  chrome.extension.onMessage.addListener(function(request, sender) {
	  if (request.action === "getSource") {
		text = request.source;
	  }
	  });
		getHTML();
	gpa = parseHTML(text);

    });
    
    
    var button2 = document.getElementById('getGPA');
    button2.addEventListener('click',function(){
        getGPA(gpa);
    })
});
 

function getGPA(gpa){
    var sumCreds = 0;
    var sumGPA = 0;
    var id; var input;
    for (i = 0; i<gpa.length;i++){
        id = gpa[i][0]+gpa[i][1];
            if (document.getElementById("ch"+i).checked){
                if (gpa[i][3] === "CR"){
                    continue;
                }
                sumGPA = sumGPA + gpa[i][3]*gpa[i][4];
                sumCreds = sumCreds + gpa[i][4];
            }//}
        }
        document.getElementById("GPA").textContent = "Average GPA: " + sumGPA/sumCreds;
        document.getElementById("GPA").style.display = "block";
}
function parseHTML(myText){
	document.getElementById('message').textContent = "Please click to import your courses.";
	document.getElementById('getClasses').textContent = "Get courses!";
        if (myText !== "parsing"){
                document.getElementById("message").textContent = "";
                var re =  />Instructor\&nbsp\;\&nbsp\;(\s*\S*)*/i; 
		var classSect = myText.match(re);
		var classTR = /<TR>(\s*?\S*?)*?<\/TR>/gi;  //(\S*\s*)*\<tr\/\>/g;
                var myArray = classSect[0].match(classTR);
		var gpaInfo = makeDict(myArray);
                formatCheckBoxes(gpaInfo);	
                changeButton();
                return gpaInfo;
        };
};

function changeButton(){
    var button = document.getElementById('getClasses');
    button.style.display = "none";
    var button2 = document.getElementById('getGPA');
    button2.style.display = "block";
    document.getElementById("message").textContent = "Please choose the courses you would like factored into your GPA:";
    
}

function formatCheckBoxes(gpaInfo){
    for (i = 0; i<gpaInfo.length; i++){
        var div = document.createElement("div");
        var id = gpaInfo[i][0]+gpaInfo[i][1];
        div.setAttribute('id',id);
        div.style.display = "block";
        document.getElementById("checkboxes").appendChild(div);
        var pair = gpaInfo[i][0] + " " + gpaInfo[i][1]+" - " + gpaInfo[i][2];
        var label= document.createElement("label");
        var description = document.createTextNode(pair);
        var checkbox = document.createElement("input");   
        checkbox.type = "checkbox";    // make the element a checkbox
        checkbox.name = "slct[]";      // give it a name we can check on the server side
        checkbox.value = pair;         // make its value "pair"
        checkbox.setAttribute('id',"ch"+i)
        label.appendChild(checkbox);   // add the box to the element
        label.appendChild(description);// add the description to the element

        // add the label element to your div
        document.getElementById(id).appendChild(label);
    };

}



function makeDict(myArray){
	//var gpaInfo = new Array();
	var re, sub, title, params, credits, letterGrade, gradeNum, creditsNum, subNum;
        var gpaInfo = [];
        var n = 0;
	for (i=0; i<myArray.length; i++){
                if (myArray[i].search("darkblue") > -1){
                    if (myArray[i].match(/tr>/ig).length <=2){
                        myArray[i] = myArray[i].replace("amp;","")
                        re = /"dddefault">(\S*?\s*?)*?<\/td>/gi;
                        params = myArray[i].match(re);
                        sub = params[0].match(/>(\S*?\s*?)*?</i);
                        sub = sub[0].replace(">","").replace("<","");
                        subNum = params[1].match(/>(\S*?\s*?)*?</i);
                        subNum = subNum[0].replace(">","").replace("<","");
                        title = params[2].match(/text\">(\S*?\s*?)*?</i);
                        title = title[0].replace("text\"\>","").replace("<","");
                        letterGrade = params[3].match(/text\">(\S*?\s*?)*?</i);
                        letterGrade = letterGrade[0].replace("text\"\>","").replace("<","");
                        gradeNum = gradeToNum(letterGrade);
                        credits = params[4].match(/text\">(\S*?\s*?)*?</i);
                        credits = credits[0].replace("text\"\>","").replace("<","");
                        creditsNum = parseFloat(credits);
                        gpaInfo[n] = [sub,subNum,title,gradeNum,creditsNum];
                        n = n+1;
                    }
                }
	}
	return gpaInfo;
}

function gradeToNum(grade){
    if (grade === "CR"){
        return "CR";
    }
	var num = 0.0;
        if (grade[0] === "A"){
            num = 4.0; }
        if (grade[0] === "B"){
            num = 3.0; }
        if (grade[0] === "C"){
            num = 2.0; }
        if (grade[0] === "D"){
            num = 1.0; }
	if (grade.length === 2){
		if (grade[1] === "+"){
                    num = num +.3333;}
                if (grade[1] === "-"){
                    num = num -.3333;}
	}
	return num;
}
 
function getHTML() { 
  var message = document.querySelector('#message');
  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.extension.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.extension.lastError.message;
    }
  });
};
