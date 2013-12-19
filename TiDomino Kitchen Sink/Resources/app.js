//Create Mobile Window to output data
var win = Titanium.UI.createWindow({  
    title:'TiDomino Console',
    backgroundColor:'#fff'
});
var scrollView = Ti.UI.createScrollView();
var label = Ti.UI.createLabel();
scrollView.add(label);

//Initialize TiDomino Session
var Session = require('TiDomino');
var ss = new Session();
var timeout2 = 5000;

/*
 * **********
 * PARAMETERS
 * **********
 */

//GLOBAL PARAMETERS
var serverKey = "acme"; //Any Key
var dominoServer = "ACME/Server";
var serverHostName = "www.acme.com";
var isHTTPS = false;
var requireInternetConnection = false; //If TRUE, I will make sure there's an internet connection before continuing

//FUNCTION 1 PARAMETERS
var username = "John Doe";
var password = "password";

//FUNCTION 2 PARAMETERS
var dbFilePath = "tidomino_sampledb.nsf";
var viewName = "Mobile_TimesheetsByKey";
var key = "MobileKey";
var fieldsToReturn = "Date,Employee,TimeSpent,Description";

//FUNCTION 3 PARAMETERS
var dbFilePath2 = "tidomino_sampledb.nsf";
var xpage = "xagent.xsp";
var parameters = {key:"1"};

//FUNCTION 4 PARAMETERS
var dbFilePath3 = "tidomino_sampledb.nsf";


/*
 * *********
 * FUNCTIONS
 * *********
 */

//FUNCTION 1 - Login User
var con = ss.createServerConnection(serverKey, dominoServer, serverHostName, isHTTPS, requireInternetConnection);
ss.loginUser(con, username, password, processLogin, null);

//FUNCTION 2 - NotesDocumentCollection - GetAllDocumentsByKey
function processLogin(result, params){
	label.text = result;

	var db = ss.getDatabase(con, dbFilePath);
	var view = db.getView(viewName);
	view.getAllDocumentsByKey(key, true, fieldsToReturn, processGetAllDocumentsByKey, null);
}

//FUNCTION 3 - Run XAgent
function processGetAllDocumentsByKey(result, params){
	label.text = result;

	var db = ss.getDatabase(con, dbFilePath2);
	db.runXAgent(xpage, parameters, processRunXAgent, null);

}

//FUNCTION 4 - NotesDocument - Save
function processRunXAgent(result, params){
	label.text = result;

	var db = ss.getDatabase(con, dbFilePath3);
	
	var doc = db.createDocument({
		Form:'TitaniumDoc',
		Status:'New'
	});
	doc.Title = "Test Title";
	
	doc.save(processSaveNotesDocument, null);
	
}

//FUNCTION 5 - Logout User
function processSaveNotesDocument(result, params){
	label.text = result;
	
	setTimeout(function(e){	
		ss.logoutUser(con, processLogout, null);
	}, timeout2);
}

function processLogout(result, params){
	label.text = result;
}

win.add(scrollView);
win.open();