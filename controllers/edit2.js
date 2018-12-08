function reasonForBloom(site, date) {
  let sql = `SELECT * FROM ` +site+` where date = `+date+ `;`
  db.query(sql, (err, result)=>{
    console.log(result);
  })
}
