function StartApp(){
    //Check if Custom Values exist for Setup, otherwise default to Guest Template
    var setup = Ti.App.Properties.getString(uku.propertyKeys.setup, "");

    if(setup === ""){
        uku.setupData = uku.guestSetupTemplate;
    }else{
        uku.customValuesLoaded = true;
        uku.setupData = JSON.parse(setup);
    }

    CreateServerConnection();

    return true;
}

function CreateServerConnection(){
    uku.con = uku.ss.createServerConnection(uku.setupData.serverKey, uku.setupData.dominoServer, uku.setupData.serverHostName, uku.setupData.isHTTPS, uku.setupData.requireInternetConnection);
    return true;
}

exports.StartApp = StartApp;
exports.CreateServerConnection = CreateServerConnection;