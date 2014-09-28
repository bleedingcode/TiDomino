function InitRowClick(e){
    Ti.API.info('---');
    Ti.API.info(JSON.stringify(e));
    Ti.API.info('---');
    var winName = "";

    switch (e.row.id){
        case "row1": //Login
            winName = "rowLogin";
            break;
    }

    if(winName !== ""){
        var Alloy = require('alloy');
        var win = Alloy.createController(winName).getView();
        uku.tabGroup.activeTab.open(win);
    }

    return true;
}