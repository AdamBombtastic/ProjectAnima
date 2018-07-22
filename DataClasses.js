/**
 * 
 * Fix this stuff later
 * Promises vs Async/await
 * 
 * TODO: Write a manager class that loads all this stuff into memory.
 * 
 */



module.exports = {
    DataObject : function(db) {
        this.db = db;

        this.tableName = "DataObjects";
        this.columnNames = ["hmy","data","type"];
        this.columnTypes = ["integer","text", "integer"];
        
        this.hmy = 0;
        this.type = 0;
        this.data = {
            /*Actual Variables go here*/
        }

        this.Post = async function() {
            return await this._runSafe(this._postSQL());
        }
        this.Read = async function(hmy) {
            var rows =  await this._querySafe(this._readSQL(hmy));
            if (rows != null) {
                return await this._readParse(rows);
            }
            return false;
        }
        this.ReadWhere = async function(colnames,vals) {
            var rows = await this._querySafe(this._readWhereSQL(colnames,vals));
            if (rows != null) {
                return await this._readParse(rows);
            }
            return false;
        }
        this.CreateTable = async function() {
            return await this._runSafe(this._createTableSQL());
        }
        this._runSafe = function(sql) {
            return new Promise(resolve => {
                this.db.run(sql,(err)=>{
                    var success= false;
                    if (err) {
                        console.log(err.message);
                    }
                    else success = true;
                    resolve(success);
                });
            ;});
        }
        this._querySafe = function(sql) {
            /**
             * TODO: Use async and wait 
             */
            return new Promise(resolve => {
                this.db.all(sql,[],(err,rows)=>{
                    if (err) {
                        console.log(err.message);
                        resolve(null);
                    }
                    else {
                        resolve(rows);
                    }
                });
            });
        },
        this._postSQL = function() {
            var sql = "";
            if (this.hmy == 0) {
                sql = this._insertSQL();
            }
            else {
                sql = this._updateSQL();
            }
            return sql;
        }
        this._readSQL = function(hmy) {
            var sql = "SELECT " + this._getColSQL() + " from " + this.tableName + " where hmy="+hmy;
            //console.log(sql);
            return sql;
        },
        //ASSUME THIS IS ONLY FOR DATA
        this._readWhereSQL = function(colNames,vals) {
            var sql = "SELECT " + this._getColSQL() + " from " + this.tableName + " where 1=1 ";
            for (var i = 0; i < colNames.length && i < vals.length; i++) {
                sql += "AND data LIKE '%";
                sql += '"'+colNames[i]+'":"'+vals[i]+'"%'+"' ";
            }
            return sql+" LIMIT 1;";
        },
        this._readParse = function(rows) {
            
            if (rows == null || rows.length == 0) return false;
            var row = rows[0];
            this.hmy = row.hmy;
            this.type = row.type;
            this.data = JSON.parse(row.data);
            return true;
        }
        this._insertSQL = function() {
            var sql = "INSERT INTO " + this.tableName + " ("+this._getColNoHMYSQL() +") VALUES (" + this._getPropNoHMYSQL() + ");";
            return sql;
        }
        this._updateSQL = function() {
            var sql = "UPDATE " + this.tableName +" SET ";
            for (let i = 0; i < this.columnNames.length; i++) {
                sql += this.columnNames[i] + "=";
                if (typeof this[this.columnNames[i]] == 'object') sql += "'"+JSON.stringify(this[this.columnNames[i]])+"' ,";
                else if (this.columnTypes[i] == "text") {
                    sql += "'"+this[this.columnNames[i]]+"'";
                }
                else sql += this[this.columnNames[i]];
                sql +=","
            }
           sql = sql.substring(0,sql.length-1);
           return sql + " WHERE hmy = " + this.hmy;
        }
        this._getColSQL = function() {
            var sql = "";
            for (let i = 0; i < this.columnNames.length; i++) {
                sql += this.columnNames[i] + ", ";
                
            }
            return sql.substring(0,sql.length-2);
        }
        this._getColNoHMYSQL = function() {
            var sql = "";
            for (let i = 1; i < this.columnNames.length; i++) {
                sql += this.columnNames[i] + " ,";
                
            }
            return sql.substring(0,sql.length-1);
        }
        this._getPropNoHMYSQL = function() {
            var sql = "";
            for (let i = 1; i < this.columnNames.length; i++) {
                var myVar = this[this.columnNames[i]];

                if (typeof myVar == 'object') sql += "'"+JSON.stringify(myVar)+"' ,";
                else if (this.columnTypes[i] == "text") {
                   sql += "'" +this[this.columnNames[i]] + "' ,";
                }
                else sql += this[this.columnNames[i]] + " ,";
               
            }
            return sql.substring(0,sql.length-1);
        }
        this._getPropSQL = function() {
            var sql = "";
            for (let i = 0; i < this.columnNames.length; i++) {
                var myVar = this[this.columnNames[i]];

                if (typeof myVar == 'object') sql += "'"+JSON.stringify(myVar)+"' ,";
                else if (this.columnTypes[i] == "text") {
                   sql += "'" +this[this.columnNames[i]] + "', ";
                }
                else sql += this[this.columnNames[i]] + ", ";
               
            }
            return sql.substring(0,sql.length-1);
        }
        this._createTableSQL = function() {
            //TODO: Fix this shit
            var sql = "CREATE TABLE IF NOT EXISTS " + this.tableName + " (";
            sql += "hmy INTEGER PRIMARY KEY AUTOINCREMENT, data text, type integer";
            sql += ");";
            return sql;
        }
    },  




/*  MD5 (Message-Digest Algorithm
*  http://www.webtoolkit.info/
*/
MD5Salt:"102926291019213",
MD5:function(r){
    function n(r,n){return r<<n|r>>>32-n}function t(r,n){var t,o,e,a,u;return e=2147483648&r,a=2147483648&n,u=(1073741823&r)+(1073741823&n),(t=1073741824&r)&(o=1073741824&n)?2147483648^u^e^a:t|o?1073741824&u?3221225472^u^e^a:1073741824^u^e^a:u^e^a}function o(r,o,e,a,u,f,i){var C;return t(n(r=t(r,t(t((C=o)&e|~C&a,u),i)),f),o)}function e(r,o,e,a,u,f,i){var C;return t(n(r=t(r,t(t(o&(C=a)|e&~C,u),i)),f),o)}function a(r,o,e,a,u,f,i){return t(n(r=t(r,t(t(o^e^a,u),i)),f),o)}function u(r,o,e,a,u,f,i){return t(n(r=t(r,t(t(e^(o|~a),u),i)),f),o)}function f(r){var n,t="",o="";for(n=0;n<=3;n++)t+=(o="0"+(r>>>8*n&255).toString(16)).substr(o.length-2,2);return t}var i,C,c,g,h,v,d,S,m,l=Array();for(l=function(r){for(var n,t=r.length,o=t+8,e=16*((o-o%64)/64+1),a=Array(e-1),u=0,f=0;f<t;)u=f%4*8,a[n=(f-f%4)/4]=a[n]|r.charCodeAt(f)<<u,f++;return u=f%4*8,a[n=(f-f%4)/4]=a[n]|128<<u,a[e-2]=t<<3,a[e-1]=t>>>29,a}(r=function(r){r=r.replace(/\r\n/g,"\n");for(var n="",t=0;t<r.length;t++){var o=r.charCodeAt(t);o<128?n+=String.fromCharCode(o):o>127&&o<2048?(n+=String.fromCharCode(o>>6|192),n+=String.fromCharCode(63&o|128)):(n+=String.fromCharCode(o>>12|224),n+=String.fromCharCode(o>>6&63|128),n+=String.fromCharCode(63&o|128))}return n}(r)),v=1732584193,d=4023233417,S=2562383102,m=271733878,i=0;i<l.length;i+=16)C=v,c=d,g=S,h=m,d=u(d=u(d=u(d=u(d=a(d=a(d=a(d=a(d=e(d=e(d=e(d=e(d=o(d=o(d=o(d=o(d,S=o(S,m=o(m,v=o(v,d,S,m,l[i+0],7,3614090360),d,S,l[i+1],12,3905402710),v,d,l[i+2],17,606105819),m,v,l[i+3],22,3250441966),S=o(S,m=o(m,v=o(v,d,S,m,l[i+4],7,4118548399),d,S,l[i+5],12,1200080426),v,d,l[i+6],17,2821735955),m,v,l[i+7],22,4249261313),S=o(S,m=o(m,v=o(v,d,S,m,l[i+8],7,1770035416),d,S,l[i+9],12,2336552879),v,d,l[i+10],17,4294925233),m,v,l[i+11],22,2304563134),S=o(S,m=o(m,v=o(v,d,S,m,l[i+12],7,1804603682),d,S,l[i+13],12,4254626195),v,d,l[i+14],17,2792965006),m,v,l[i+15],22,1236535329),S=e(S,m=e(m,v=e(v,d,S,m,l[i+1],5,4129170786),d,S,l[i+6],9,3225465664),v,d,l[i+11],14,643717713),m,v,l[i+0],20,3921069994),S=e(S,m=e(m,v=e(v,d,S,m,l[i+5],5,3593408605),d,S,l[i+10],9,38016083),v,d,l[i+15],14,3634488961),m,v,l[i+4],20,3889429448),S=e(S,m=e(m,v=e(v,d,S,m,l[i+9],5,568446438),d,S,l[i+14],9,3275163606),v,d,l[i+3],14,4107603335),m,v,l[i+8],20,1163531501),S=e(S,m=e(m,v=e(v,d,S,m,l[i+13],5,2850285829),d,S,l[i+2],9,4243563512),v,d,l[i+7],14,1735328473),m,v,l[i+12],20,2368359562),S=a(S,m=a(m,v=a(v,d,S,m,l[i+5],4,4294588738),d,S,l[i+8],11,2272392833),v,d,l[i+11],16,1839030562),m,v,l[i+14],23,4259657740),S=a(S,m=a(m,v=a(v,d,S,m,l[i+1],4,2763975236),d,S,l[i+4],11,1272893353),v,d,l[i+7],16,4139469664),m,v,l[i+10],23,3200236656),S=a(S,m=a(m,v=a(v,d,S,m,l[i+13],4,681279174),d,S,l[i+0],11,3936430074),v,d,l[i+3],16,3572445317),m,v,l[i+6],23,76029189),S=a(S,m=a(m,v=a(v,d,S,m,l[i+9],4,3654602809),d,S,l[i+12],11,3873151461),v,d,l[i+15],16,530742520),m,v,l[i+2],23,3299628645),S=u(S,m=u(m,v=u(v,d,S,m,l[i+0],6,4096336452),d,S,l[i+7],10,1126891415),v,d,l[i+14],15,2878612391),m,v,l[i+5],21,4237533241),S=u(S,m=u(m,v=u(v,d,S,m,l[i+12],6,1700485571),d,S,l[i+3],10,2399980690),v,d,l[i+10],15,4293915773),m,v,l[i+1],21,2240044497),S=u(S,m=u(m,v=u(v,d,S,m,l[i+8],6,1873313359),d,S,l[i+15],10,4264355552),v,d,l[i+6],15,2734768916),m,v,l[i+13],21,1309151649),S=u(S,m=u(m,v=u(v,d,S,m,l[i+4],6,4149444226),d,S,l[i+11],10,3174756917),v,d,l[i+2],15,718787259),m,v,l[i+9],21,3951481745),v=t(v,C),d=t(d,c),S=t(S,g),m=t(m,h);return(f(v)+f(d)+f(S)+f(m)).toLowerCase();
},
}
/*

*** Might not need this ***

function DataObjectManager(db) {
    this.db = myDB;
    this.ready = true;
    this.queries = []; //sql, callback
    
    this.CreateTableAsync = function(dataObject, callback=null) {
        this._safeExec(dataObject._createTable(), callback);
    }
    this.PostAsync=function(dataObject, callback=null) {
        this._safeExec(dataObject._post(),callback);
    }
    this.Post=function(dataObject) {
        db.serialize(()=> {

        });
    }
    this.Query=function(sql) {

    }
    this._safeExec = function(sql,callback=null) {
        if (this.ready) {
            this.ready = false;
            if (sql.toLowerCase().indexOf("select") != -1) {
                this.db.all(sql,[],(error,rows) => {
                    this._sqlCallback(error,rows,callback);
                });
            }
            else {
                this.db.run(sql,(error)=> {
                    this._sqlCallback(error,null,callback);
                });
            }
        }
        else {
            this.queries.push({sql : sql, callback : callback});
        }
        
    },
    this._sqlCallback = function(error,result=null,callback=null) {
        if (callback != null) callback.call(error,result);
        if (this.queries.length > 0) {
            this.queries.reverse();
            var myObj = this.queries.pop();
            this.ready = true;
            this._safeExec(myObj.sql, myObj.callback);
            this.queries.reverse();
        }
        else this.ready = true;   
    }
}*/