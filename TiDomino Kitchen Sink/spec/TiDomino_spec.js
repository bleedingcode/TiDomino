//Initialize TiDomino Session and Set default Parameters
var Session = require('TiDomino');

var ss = null;
var con = null;
var describeKey = "";
var string1 = " - Wait for result";
var string2 = " Result [Success Param] = ";
var timeout1 = 3000;
var timeout2 = 10000;

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

//UNIT TEST 1 PARAMETERS
var username = "John Doe";
var password = "password";

//UNIT TEST 2 PARAMETERS
var dbFilePath = "tidomino_sampledb.nsf";
var viewName = "Mobile_TimesheetsByKey";
var key = "MobileKey";
var fieldsToReturn = "Date,Employee,TimeSpent,Description";

//UNIT TEST 3 PARAMETERS
var dbFilePath2 = "tidomino_sampledb.nsf";
var xpage = "xagent.xsp";
var parameters = {key:"1"};

//UNIT TEST 4 PARAMETERS
var dbFilePath3 = "tidomino_sampledb.nsf";

//UNIT TESTS
describe("New Session Object", function(){
	describeKey = "Session Object";
	it(describeKey, function() {
		ss = new Session();
		expect(ss.initialized).toBe(true);
	});
	
	//UNIT TEST 1.1
	describeKey = "ServerConnection Object";
	it(describeKey, function() {
		con = ss.createServerConnection(serverKey, dominoServer, serverHostName, isHTTPS, requireInternetConnection);
	    expect(ss.ServerConnection).not.toBe(false);
	});
	
	//UNIT TEST 1.2
	describeKey = "Auto Login";
	it(describeKey, function() {
		ss.loginUser(con, username, password, processUserLogin, null);
		
		function processUserLogin(result, params){
			describeKey = "Auto Login";
			Ti.API.info(describeKey + string2 + result.success + " - " + result.description);
		}
	});
	
	//UNIT TEST 2
	describeKey = "Get All Docs By Key";
	it(describeKey, function() {		
		var db = ss.getDatabase(con, dbFilePath);
		var view = db.getView(viewName);
		
		setTimeout(function(e){
			view.getAllDocumentsByKey(key, true, fieldsToReturn, processNotesDocumentCollection, null);
		}, timeout1);
		
		function processNotesDocumentCollection(result, params){
			describeKey = "Get All Docs By Key";
			Ti.API.info(describeKey + string2 + result.success + " - " + result.description);
		}
	});
	
	//UNIT TEST 3
	describeKey = "Run XAgent";
	it(describeKey, function() {
		var db = ss.getDatabase(con, dbFilePath2);
		
		setTimeout(function(e){		
			db.runXAgent(xpage, parameters, processNotesXAgent, null);
		}, timeout1);
				
		function processNotesXAgent(result, params){
			describeKey = "Run XAgent";
			Ti.API.info(describeKey + string2 + result.success + " - " + result.description);
		}
	});
	
	//UNIT TEST 4
	describeKey = "Save Notes Document";
	it(describeKey, function() {
		var db = ss.getDatabase(con, dbFilePath3);
		var doc = db.createDocument({
			Form:'TitaniumDoc',
			Status:'New'
		});
		doc.Title = "Test Title";
		
		setTimeout(function(e){		
			doc.save(processSavedDocument, null);
		}, timeout1);
				
		function processSavedDocument(result, params){
			describeKey = "Save Notes Document";
			Ti.API.info(describeKey + string2 + result.success + " - " + result.description);
		}
	});	
	
	//UNIT TEST 5
	describeKey = "Auto Logout";
	it(describeKey, function() {
		setTimeout(function(e){
			ss.logoutUser(con, processLogout, null);
		}, timeout2);
		
		function processLogout(result, params){
			describeKey = "Auto Logout";
			Ti.API.info(describeKey + string2 + result.success + " - " + result.description);
		}
	});
});