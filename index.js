const { SQLite } = require( './sqlite.js' );

module.exports = {
    open: function( connection ) {
        return new SQLite( connection.Database );
    }
};
