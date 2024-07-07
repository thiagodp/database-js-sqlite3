const Database = require('better-sqlite3');

class SQLite {

    _db = null;
    _inTransaction = false;

    constructor( database, options ) {
        if ( ! database ) {
            throw new Error( 'Please inform the database.' );
        }
        this._db = new Database( database, options );
    }

    async query( sql, params ) {
        return new Promise( ( resolve, reject ) => {
            try {
                const stmt = this._db.prepare( sql );
                if ( params ) {
                    resolve( stmt.all( ...params ) );
                } else {
                    resolve( stmt.all() );
                }
            } catch ( err ) {
                reject( err );
            }
        } );
    }

    async exec( sql, params ) {
        return new Promise( ( resolve, reject ) => {
            try {
                const stmt = this._db.prepare( sql );
                if ( params ) {
                    resolve( stmt.run( ...params ) );
                } else {
                    resolve( stmt.run() );
                }
            } catch ( err ) {
                reject( err );
            }
        } );
    }

    close() {
        return new Promise( ( resolve, reject ) => {
            try {
                this._db.close();
                resolve( true );
            } catch ( err ) {
                reject( err );
            }
        } );
    }

    flush() {
        // Not needed
    }

    isTransactionSupported() {
        return true;
    }

    inTransaction() {
        return this._inTransaction;
    }

    beginTransaction() {
        if ( this._inTransaction ) {
            return Promise.resolve( false );
        }
        return new Promise( ( resolve, reject ) => {
            this.exec( 'BEGIN' )
                .then( () => {
                    this._inTransaction = true;
                    resolve( true );
                } )
                .catch( err => {
                    reject( err );
                } );
        } );
    }

    commit() {
        return this.__finishTransaction( 'COMMIT' );
    }

    rollback() {
        return this.__finishTransaction( 'ROLLBACK' );
    }

    __finishTransaction( transactionCommand ) {
        if ( ! this._inTransaction ) {
            return Promise.resolve( false );
        }
        return new Promise( ( resolve, reject ) => {
            this.exec( transactionCommand )
                .then( () => {
                    this._inTransaction = false;
                    resolve( true );
                } )
                .catch( err => {
                    reject( err );
                } );
        } );
    }

}

module.exports = { SQLite };