if(uku.customValuesLoaded){
    _LoadCustomValues();
}

/*PUBLIC FUNCTIONS*/
function Field1Return(){
	$.field2.focus();
	return true;
}

function Field2Return(){
	$.field3.focus();
	return true;
}

function SaveCustomValues(){
    //First Validate fields
    var validationPassed = true;

    if($.field1.value === ""){
        validationPassed = false;
        $.label1.color = '#DA251C';
    }else{
        $.label1.color = '999';
    }

    if($.field2.value === ""){
        validationPassed = false;
        $.label2.color = '#DA251C';
    }else{
        $.label2.color = '#999';
    }

    if($.field3.value === ""){
        validationPassed = false;
        $.label3.color = '#DA251C';
    }else{
        $.label3.color = '#999';
    }

    //If Validation Passed, Save custom values
    if(validationPassed){
    	var setup = {
		    serverKey:$.field1.value,
		    dominoServer:$.field2.value,
		    serverHostName:$.field3.value,
		    isHTTPS:$.switch1.value,
		    requireInternetConnection:$.switch2.value    		
    	};

		uku.setupData = setup;
        uku.customValuesLoaded = true;
        main.CreateServerConnection();
        Ti.App.Properties.setString(uku.propertyKeys.setup, JSON.stringify(setup));

        alert('Setup successfully saved');
    }else{
        alert("Please complete all fields marked in red");
    }

    return true;
}

function ResetCustomValues(){
    var dialog = Ti.UI.createAlertDialog({
        title:'Resetting Custom Values',
        message:'Are you sure you want to reset these values back to the default App Values?',
        buttonNames:['Yes', 'No']
    });

    dialog.addEventListener('click', function(f){
        switch(f.index){
            case 0://Yes
                uku.setupData = uku.guestSetupTemplate;
                uku.customValuesLoaded = false;
                main.CreateServerConnection();
                Ti.App.Properties.removeProperty(uku.propertyKeys.setup);

                _ResetFields();

                dialog.hide();
                dialog = null;
                break;
            case 1://No
                dialog.hide();
                dialog = null;
                break;
        }
    });

    dialog.show();
}

/*PRIVATE FUNCTIONS*/
function _LoadCustomValues(){
    $.field1.value = uku.setupData.serverKey;
    $.field2.value = uku.setupData.dominoServer;
    $.field3.value = uku.setupData.serverHostName;
    $.switch1.value = uku.setupData.isHTTPS;
    $.switch2.value = uku.setupData.requireInternetConnection;

    return true;
}

function _ResetFields(){
    $.field1.value = "";
    $.field2.value = "";
    $.field3.value = "";
    $.switch1.value = false;
    $.switch2.value = true;

    return true;
}