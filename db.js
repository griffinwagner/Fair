module.exports = function(mysql) {
  // create connection
  const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'password',
    database : 'levels'
  });

  // connect
  db.connect(function(err) {
    if(err){
      throw err;
    };
    console.log('Mysql is connected');
  });

  return db;
}
