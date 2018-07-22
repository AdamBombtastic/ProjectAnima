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