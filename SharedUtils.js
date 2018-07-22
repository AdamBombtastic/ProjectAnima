module.exports = {
    //Shit here
    CookieManager : {
        _cookies : {},
        getCookie : function(name) {
            //Do the thing
        },
        GetCookies : function(name) {
            this._cookies= {};
            
        }
    },
    DatabaseHelper : {
        NodeSessionStateSQL : "CREATE TABLE NodeSessionState(" +
                            " id integer PRIMARY KEY AUTOINCREMENT, "+
                            " data text NOT NULL, "+
                            " dtCreated text NOT NULL, "+
                            " dtExpire text NOT NULL); ",
    },
};