var Session = require('TiDomino');

var globals = {
    ss:new Session(),
    con:null,
    hud:require('hud'),
    tabGroup:null,
    customValuesLoaded:false,
    guestSetupTemplate:{
	    serverKey:'ukuweb',
	    dominoServer:'UKUWEB01/Server/Ukuvuma',
	    serverHostName: 'ukuweb01.ukuvuma.co.za',
	    isHTTPS:true,
	    requireInternetConnection:true
    },
    setupData:{},
    loginParams:{
        username:'John Jardin',
        password:'Tolkien0814'
    },
    function1Params:{//Get All Documents By Key
        dbFilePath:'tidomino_sampledb.nsf',
        viewName:'Mobile_TimesheetsByKey',
        key:'MobileKey',
        fieldsToReturn:'Date,Employee,TimeSpent,Description'
    },
    function2Params:{//Run XAgent
        dbFilePath2:'tidomino_sampledb.nsf',
        xpage:'xagent.xsp',
        parameters:{
            key:'1'
        }
    },
    function3Params:{//NotesDocument.Save
        dbFilePath3:'tidomino_sampledb.nsf'
    },
    propertyKeys:{
    	setup:"TidominoSetup",
    	function1:"TiDominoFunction1",
    	function2:"TiDominoFunction2",
    	function3:"TiDominoFunction3",    	
    }
};

exports.globals = globals;