const { SQLite } = require("../sqlite");
const { unlinkSync, existsSync } = require("fs");
const assert = require("assert");

const TEMP_DB_FILE = 'temp.sqlite';

describe( 'SQLite', () => {

    let db;

    before( () => {
        db = new SQLite( TEMP_DB_FILE );
    } );

    after( async () => {
        await db.close();
        unlinkSync( TEMP_DB_FILE );
    } );

    it( 'can create a new database', async () => {
        const databaseExist = existsSync( TEMP_DB_FILE );
        assert.ok( databaseExist );
    } );

    it( 'can run commands', async () => {
        await db.exec( 'CREATE TABLE IF NOT EXISTS foo ( bar TEXT )' );
        await db.exec( 'DROP TABLE foo' );
    } );

    it( 'can query', async () => {
        await db.exec( 'CREATE TABLE IF NOT EXISTS foo ( bar TEXT )' );
        await db.exec( "INSERT INTO foo ( bar ) VALUES ( 'Hello' ), ( 'World' )" );
        const rows = await db.query( 'SELECT * FROM foo' );
        assert.equal( rows[ 0 ][ 'bar'], 'Hello' );
        assert.equal( rows[ 1 ][ 'bar'], 'World' );
    } );

    it( 'can rollback a transaction', async () => {
        await db.exec( 'CREATE TABLE IF NOT EXISTS foo ( bar TEXT )' );
        await db.beginTransaction();
        await db.exec( "DELETE FROM foo" );
        await db.exec( "INSERT INTO foo ( bar ) VALUES ( '1' )" );
        await db.exec( "INSERT INTO foo ( bar ) VALUES ( '2' )" );
        await db.rollback();
        const rows = await db.query( "SELECT * FROM foo WHERE bar = '1' OR bar = '2'" );
        assert.equal( rows.length, 0 );
    } );

    it( 'can commit a transaction', async () => {
        await db.exec( 'CREATE TABLE IF NOT EXISTS foo ( bar TEXT )' );
        await db.beginTransaction();
        await db.exec( "DELETE FROM foo" );
        await db.exec( "INSERT INTO foo ( bar ) VALUES ( '1' )" );
        await db.exec( "INSERT INTO foo ( bar ) VALUES ( '2' )" );
        await db.commit();
        const rows = await db.query( "SELECT * FROM foo" );
        assert.equal( rows.length, 2 );
    } );

} );