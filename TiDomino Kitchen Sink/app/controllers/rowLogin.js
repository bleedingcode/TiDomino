/*GLOBALS*/
if(uku.customValuesLoaded){
    $.viewCustom.show();
    $.viewGuest.hide();
}else{
    $.viewCustom.hide();
    $.viewGuest.show();
}

/*PUBLIC FUNCTIONS*/
function Field1Return(){
    $.field2.focus();
    return true;
}

function SignIn(){
    //If Custom Sign In, validate Username and Password
    var validationPassed = true;
    var username = "";
    var password = "";

    if(uku.customValuesLoaded){
        if($.field1.value === ""){
            validationPassed = false;
            $.label1.color = '#DA251C';
        }else{
            username = $.field1.value;
            $.label1.color = '999';
        }

        if($.field2.value === ""){
            validationPassed = false;
            $.label2.color = '#DA251C';
        }else{
            password = $.field2.value;
            $.label2.color = '#999';
        }
    }else{
        username = uku.loginParams.username;
        password = uku.loginParams.password;
    }

    //If Validation Passed, Authenticate User with Domino
    if(validationPassed){
        uku.hud.load('Signing In').show();
        uku.ss.loginUser(uku.con, username, password, _ProcessSignIn, null);
    }else{
        alert("Please complete all fields marked in red");
    }

    return true;
}

/*PRIVATE FUNCTIONS*/
function _ProcessSignIn(result, params){
    Ti.API.info(JSON.stringify(result));
    uku.hud.hide();
    return true;
}