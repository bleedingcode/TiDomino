//GLOBAL VARIABLES
var TI_DOMINO_PATH = "tidomino.nsf";
var LOCAL_HOSTNAME = "Local";
var LOGIN_DEFAULT = "?login";
var LOGOUT_DEFAULT = "./?logout";
var OPEN_DEFAULT = "?open";
var LOGIN_XPAGE = "createSession.xsp";
var DEFAULT_TIMEOUT = 10000;

/*
 * SESSION OBJECT
 */
function Session(){
	//Populate Local Paramters
	this.appDirectoryPath = Ti.Filesystem.applicationDataDirectory;
	this.appDescription = Ti.App.description;
	this.appVersion = Ti.App.version;
	this.osName = Ti.Platform.osname;
	this.osVersion = Ti.Platform.version;
	this.platform = Ti.Platform.name;
	this.macAddress = Ti.Platform.macaddress;
	this.wifiAddress = Ti.Platform.address;
	this.locale = Ti.Platform.locale;
	this.deviceManufacturer = Ti.Platform.manufacturer;
	this.deviceModel = Ti.Platform.model;
	this.ServerConnection = null;
	this.initialized = true;
	
	return true;	
}

Session.prototype.createServerConnection = function(id, serverName, hostName, isHTTPS, requireInternetConnection){
	//Strip "/" from hostName
	if((hostName === "") || (hostName.toLowerCase() === LOCAL_HOSTNAME.toLowerCase())){
		hostName = LOCAL_HOSTNAME;
	}else if(hostName.charAt( hostName.length-1 ) === "/"){
		hostName = hostName.slice(0, - 1);
	}
	
	var http = "http://";
	if(isHTTPS){
		http = "https://";
	}
		
	var con = {
		id:id,
		server:serverName,
		hostName:hostName,
		isHTTPS:isHTTPS,
		url:http + hostName,
		requireInternet:requireInternetConnection
	};
	
	var myArray = this.ServerConnection;
	
	if(myArray === null){
		myArray = [con];
	}else{
		myArray.push(con);
	}
	
	this.ServerConnection = myArray;	

	return con;
};

Session.prototype.loginUser = function(con, username, password, functionToRun, functionParams){
	if(con.server !== LOCAL_HOSTNAME){
		//Check if internet is available
		if(con.requireInternet){
			var result = _checkInternet();
				
			if(!result.success){
				//Run User's function
				functionToRun(result, functionParams);			
				return false;			
			}			
		}

		//Connect to Domino Server and Return Session and User Details
		var url = con.url + "/" + TI_DOMINO_PATH + LOGIN_DEFAULT;
		var xhr = Titanium.Network.createHTTPClient({
			onload:function(){
				var response = xhr.responseText;
				
				if(response.substring(0,1) === "{"){
					var result = JSON.parse(response);
					
					if(result.success){
						_processNewSession(result);
					}
					
					var result2 = {
						success:result.success,
						description:result.description
					};								
				}else{
					//Check to see why Authentication Failed
					var description = _validateReponseHTML(response);
					
					if(description === ""){
						description = "Authentication Failed";
					}

					var result2 = {
						success:false,
						description:description
					};												
				};
				
				result2.status = xhr.status;
				result2.statusText = xhr.statusText;
				
				//Run User's function
				functionToRun(result2, functionParams);
			},
			onerror:function(){
				var result = {
					success:false,
					description:"HTTP Request Failed",
					status:xhr.status,
					statusText:xhr.statusText				
				};
				
				//Run User's function
				functionToRun(result, functionParams);
			},
		});	

		var params = {
			username:username,
			password:password,
			redirectto:TI_DOMINO_PATH + "/" + LOGIN_XPAGE
		};
		xhr.setTimeout(DEFAULT_TIMEOUT);
		xhr.open('POST', url, true);
		xhr.send(params);
	}
	
	return true;
};

Session.prototype.logoutUser = function(con, functionToRun, functionParams){
	if(con.server !== LOCAL_HOSTNAME){
		//Check if internet is available
		if(con.requireInternet){		
			var result = _checkInternet();
				
			if(!result.success){
				//Run User's function
				functionToRun(result, functionParams);			
				return false;			
			}
		}
		
		//Connect to Domino Server and Return Session and User Details
		var url = con.url + "/" + TI_DOMINO_PATH + "/" + LOGIN_XPAGE + LOGOUT_DEFAULT;
		var xhr = Titanium.Network.createHTTPClient({
			onload:function(){
				var description = "Logout Successful";

				var result2 = {
					success:true,
					description:description
				};	
				
				result2.status = xhr.status;
				result2.statusText = xhr.statusText;
				
				//Run User's function
				functionToRun(result2, functionParams);
			},
			onerror:function(){
				var result = {
					success:false,
					description:"HTTP Request Failed",
					status:xhr.status,
					statusText:xhr.statusText				
				};
				
				//Run User's function
				functionToRun(result, functionParams);
			},
		});	

		var params = {
			redirectto:TI_DOMINO_PATH + "/" + LOGIN_XPAGE
		};
		xhr.setTimeout(DEFAULT_TIMEOUT);
		xhr.open('GET', url, true);
		xhr.send(params);
	}
	
	return true;
};

Session.prototype.getDatabase = function(con, filePath){
	var db = new NotesDatabase(con, filePath);
	db.parent = this;
	return db;
};

function _processNewSession(result){
	Session.prototype.NotesUserObject = result.NotesUserObject;
	return true;
}

/*
 * NOTESDATABASE OBJECT
 */
function NotesDatabase(con, filePath){
	this.ServerConnection = con;
	this.filePath = filePath;
}

NotesDatabase.prototype.getView = function(viewName){
	var view = new NotesView(viewName);
	view.parent = this;
	return view;
};

NotesDatabase.prototype.createDocument = function(params){
	var doc = new NotesDocument(params);
	doc.parent = this;
	return doc;
};

NotesDatabase.prototype.runXAgent = function(xpage, parameters, functionToRun, functionParams){
	//Validate XPage and check for .xsp
	if(xpage === ""){
			alert('Please provide the name of your XPage');
			return false;
	}else if(xpage.indexOf(".xsp") === -1){
		xpage += ".xsp";
	}
	
	var con = this.ServerConnection;
	if(con.server !== LOCAL_HOSTNAME){
		//Check if internet is available
		if(con.requireInternet){		
			var result = _checkInternet();
				
			if(!result.success){
				//Run User's function
				functionToRun(result, functionParams);			
				return false;			
			}	
		}
		
		var url = con.url + "/" + this.filePath + "/" + xpage + OPEN_DEFAULT;
		
		var xhr = Titanium.Network.createHTTPClient({
			onload:function(){
				var response = xhr.responseText;
				
				if(response.substring(0,1) === "{"){
					var result = JSON.parse(response);
					
					var result2 = {
						success:result.success,
						description:result.description,
						Data:result.Data
					};								
				}else{
					//Check to see why Authentication Failed
					var description = _validateReponseHTML(response);
					
					if(description === ""){
						description = "XAgent Request Failed";
					}
					
					var result2 = {
						success:false,
						description:description,
						Data:null
					};				
				}
				
				result2.status = xhr.status;
				result2.statusText = xhr.statusText;
				
				//Run User's function
				functionToRun(result2, functionParams);				
			},
			onerror:function(){
				var result = {
					success:false,
					description:"HTTP Request Failed",
					status:xhr.status,
					statusText:xhr.statusText,
					responseText:xhr.responseText			
				};
				
				//Run User's function
				functionToRun(result, functionParams);				
			}			
		});		
	
		var params = {
			key:JSON.stringify(parameters)
		};
	
		xhr.setTimeout(DEFAULT_TIMEOUT);
		xhr.open('GET', url, true);
		xhr.send(params);	
	}
};

/*
 * NOTESVIEW OBJECT
 */
function NotesView(viewName){
	this.viewName = viewName;
}
 
NotesView.prototype.getAllDocumentsByKey = function(key, exactMatch, fields, functionToRun, functionParams){
	if(!exactMatch){
		exactMatch = false;
	};
	
	if(this.parent.ServerConnection.server !== LOCAL_HOSTNAME){
		//Check if internet is available
		if(this.parent.requireInternet){		
			var result = _checkInternet();
				
			if(!result.success){
				//Run User's function
				functionToRun(result, functionParams);			
				return false;			
			}
		}
		
		var con = this.parent.ServerConnection;
		var url = con.url + "/" + TI_DOMINO_PATH + "/processDomObjectModel.xsp" + OPEN_DEFAULT;
		
		var xhr = Titanium.Network.createHTTPClient({
			onload:function(){
				var response = xhr.responseText;
				
				if(response.substring(0,1) === "{"){
					var result = JSON.parse(response);
					
					if(result.success){
						var col = _processDocumentCollection(result);
					}
					
					var result2 = {
						success:result.success,
						description:result.description,
						DocumentCollection:col
					};								
				}else{
					//Check to see why Authentication Failed
					var description = _validateReponseHTML(response);
					
					if(description === ""){
						description = "Doc Collection Request Failed";
					}
										
					var result2 = {
						success:false,
						description:description,
						DocumentCollection:null
					};				
				}
				
				result2.status = xhr.status;
				result2.statusText = xhr.statusText;
				
				//Run User's function
				functionToRun(result2, functionParams);				
			},
			onerror:function(){
				var result = {
					success:false,
					description:"HTTP Request Failed",
					status:xhr.status,
					statusText:xhr.statusText,
					responseText:xhr.responseText			
				};
				
				//Run User's function
				functionToRun(result, functionParams);				
			}			
		});
		
		var tempJSON = '{'
					 + '"processType":"1",'
					 + '"serverName":"' + con.server + '",'
					 + '"filePath":"' + this.parent.filePath + '",'
					 + '"viewName":"' + this.viewName + '",'
					 + '"key":"' + key + '",'
					 + '"exactMatch":' + exactMatch + ','
					 + '"fields":"' + fields + '"'			 
					 + '}';
	
		var params = {
			key:tempJSON
		};
	
		xhr.setTimeout(DEFAULT_TIMEOUT);
		xhr.open('GET', url, true);
		xhr.send(params);	}
};

function _processDocumentCollection(result){
	var col = new DocumentCollection(result);
	return col;
}

/*
 * NOTESDOCUMENT OBJECT
 */
function NotesDocument(params){
	
for (var key in params){
	if (params.hasOwnProperty(key)){
		this[key] = params[key];
	}
}	
	this.UniversalID = "";
	this.NoteID = "";
	this.IsModified = true;
	
	return this;
}

NotesDocument.prototype.save = function(functionToRun, functionParams){
	var con = this.parent.ServerConnection;
	if(con.server !== LOCAL_HOSTNAME){
		//Check if internet is available
		if(con.requireInternet){		
			var result = _checkInternet();
				
			if(!result.success){
				//Run User's function
				functionToRun(result, functionParams);			
				return false;			
			}
		}
		
		var url = con.url + "/" + TI_DOMINO_PATH + "/processDomObjectModel.xsp" + OPEN_DEFAULT;
		
		var xhr = Titanium.Network.createHTTPClient({
			onload:function(){
				var response = xhr.responseText;
				
				if(response.substring(0,1) === "{"){
					var result = JSON.parse(response);
					
					if(result.success){
						var doc = _processNotesDocument(result);
					}
					
					var result2 = {
						success:result.success,
						description:result.description,
						NotesDocument:doc
					};								
				}else{
					//Check to see why Save Failed
					var description = _validateReponseHTML(response);
					
					if(description === ""){
						description = "Notes Document Save Request Failed";
					}
			
					var result2 = {
						success:false,
						description:description,
						NotesDocument:null
					};				
				}
				
				result2.status = xhr.status;
				result2.statusText = xhr.statusText;
				
				//Run User's function
				functionToRun(result2, functionParams);				
			},
			onerror:function(){
				var result = {
					success:false,
					description:"HTTP Request Failed",
					status:xhr.status,
					statusText:xhr.statusText,
					responseText:xhr.responseText			
				};
				
				//Run User's function
				functionToRun(result, functionParams);				
			}			
		});
		
		var tempJSON = '{'
					 + '"processType":"2",'
					 + '"serverName":"' + con.server + '",'
					 + '"filePath":"' + this.parent.filePath + '",'
					 + '"doc":' + JSON.stringify(this)			 
					 + '}';

		var params = {
			key:tempJSON
		};
	
		xhr.setTimeout(DEFAULT_TIMEOUT);
		xhr.open('POST', url, true);
		xhr.send(params);		
	}
};

function _processNotesDocument(result){
	var doc = result.Document;
	doc.IsModified = false;
	return doc;
}

/*
 * DOCUMENTCOLLECTION OBJECT
 */
function DocumentCollection(result){
	return result.DocumentCollection;
}

//PRIVATE FUNCTIONS
function _checkInternet(){
	var result = {
		status:"",
		statusText:""				
	};
	
	if(!Ti.Network.online){
		result.success = false;
		result.description = "No Internet Connection";
		alert('Could not establish internet connection');
	}else{
		result.success = true;
		result.description = "Internet Connection Established";
	}
	
	return result;	
}

function _validateReponseHTML(response){
	//CODE
	var description = "";
	var key1 = "You are locked out";
	var key2 = "You provided an invalid username or password";
	var key3 = "Please identify yourself";
	var key4 = "Change Password";
	
	var desc1 = "User possibly Locked Out";
	var desc2 = "Invalid Username or Password";
	var desc3 = "Login";
	var desc4 = "Password is expiring. Server is requesting to change your password";
	
	//First check using no Casing, then lowercase
	if(response.indexOf(key1) !== -1){
		description = desc1;					
	}else if(response.indexOf(key2) !== -1){
		description = desc2;
	}else if(response.indexOf(key3) !== -1){
		description = desc3;
	}else if(response.indexOf(key4) !== -1){
		description = desc4;						
	}else if(response.toLowerCase().indexOf(key1.toLowerCase()) !== -1){
		description = desc1;					
	}else if(response.toLowerCase().indexOf(key2.toLowerCase()) !== -1){
		description = desc2;
	}else if(response.toLowerCase().indexOf(key3.toLowerCase()) !== -1){
		description = desc3;
	}else if(response.toLowerCase().indexOf(key4.toLowerCase()) !== -1){
		description = desc4;
	}
	
	return description;
}

module.exports = Session;