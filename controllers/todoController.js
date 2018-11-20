var session = require('express-session');
const express = require('express');

const XLSX = require('xlsx');

var Pusher = require('pusher');

var pusher = new Pusher({
  appId: '652206',
  key: '8f0b8b639e16af0e7e40',
  secret: '57a030d7b69abe1ab039',
  cluster: 'us2',
  encrypted: true
});




module.exports = function(app, db) {

  app.get('/', function(req,res){


    res.render('home')

  })

  // reading data
  app.get('/LP', function(req, res) {


    var LPNitrate = XLSX.readFile('IRL-LP-Nitrate.xlsx');
    const sheet_name_list = LPNitrate.sheetNames;


    var hello = LPNitrate.Sheets.Sheet1
    var allValues = []
    for(var sequence in hello) {
      allValues.push(LPNitrate.Sheets.Sheet1[sequence].w)

    }
    var numberOfEntries = 0
    var totalForDay = 0.0
    var allValuesJSON = JSON.stringify(allValues);
    allValues.shift()


    console.log("Hello");
    req.session.okay = "hello"
    // ***PUT ALL VALUES INTO DB************************************************************************************************
    for (var i = 0; i < allValues.length; i++) {
      if (i % 3 == 0) {
        var theVariable = JSON.stringify(allValues[i])
        let sql = `INSERT INTO numberPoint (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
        db.query(sql, (err, result)=> {
        })
      }

    }
    var allValuesDates = []
    for (var i = 0; i < allValues.length; i++) {
        if (i % 3 == 0) {
          allValuesDates.push(allValues[i])
        }
    }
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    var uniqueValueDates = allValuesDates.filter( onlyUnique );
    var array = []
    function getTheAverage(uniqueValueDates, theArray) {
      req.session.hello = 2+3
      for (var i = 0; i < uniqueValueDates.length ; i++) {
        req.session.dates = uniqueValueDates;
        let sql2 = 'SELECT AVG(level) AS averageLevel FROM numberPoint WHERE date = "' + uniqueValueDates[i] +'";'
        req.session.length = uniqueValueDates.length;
        db.query(sql2, array, (err, result)=> {
             array.push(result[0].averageLevel);
             req.session.averageLevels = array
             if (array.length == req.session.length) {
               // array.length is one more than ID of final number. Last number is null. array.length - 2 = final measurement
               req.session.array = array
               array.pop(); // to remove null. Array.length -1 = final measurement
               var dates = req.session.dates
               dates.pop();
               for (var z = 0; z < dates.length; z++) {
                 var dateString = JSON.stringify(dates[z])
                 let sql3 = `INSERT INTO LP (date) VALUES (`+dateString+`);`
                 db.query (sql3, (err, result)=> {
                 })
                 if (z+1 == dates.length) {
                   for (var q = 0; q < array.length; q++) {
                     var theLevel = array[q];
                     var idMatch = q+1;
                     console.log(idMatch);
                     let sql4 = `UPDATE LP SET nitrateLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
                     db.query (sql4, (err,result)=> {
                       console.log(sql4);
                     })
                   }

                 }
               }

             }
        });
      }
    }
    getTheAverage(uniqueValueDates, array)
    res.render('index')
    })



  app.get('/saline', function(req, res) {


      var LPSaline = XLSX.readFile('IRL-LP-Saline.xlsx');
      const sheet_name_list = LPSaline.sheetNames;


      var hello = LPSaline.Sheets.Sheet1
      var allValues = []
      for(var sequence in hello) {
        allValues.push(LPSaline.Sheets.Sheet1[sequence].w)

      }
      var numberOfEntries = 0
      var totalForDay = 0.0
      var allValuesJSON = JSON.stringify(allValues);
      allValues.shift()


      console.log("Hello");
      req.session.okay = "hello"
      // ***PUT ALL VALUES INTO DB************************************************************************************************
      for (var i = 0; i < allValues.length; i++) {
        if (i % 3 == 0) {
          var theVariable = JSON.stringify(allValues[i])
          let sql = `INSERT INTO numberPointSaline (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
          db.query(sql, (err, result)=> {
          })
        }

      }
      var allValuesDates = []
      for (var i = 0; i < allValues.length; i++) {
          if (i % 3 == 0) {
            allValuesDates.push(allValues[i])
          }
      }
      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }
      var uniqueValueDates = allValuesDates.filter( onlyUnique );
      var array = []
      function getTheAverage(uniqueValueDates, theArray) {
        req.session.hello = 2+3
        for (var i = 0; i < uniqueValueDates.length ; i++) {
          req.session.dates = uniqueValueDates;
          let sql2 = 'SELECT AVG(level) AS averageLevel FROM numberPointSaline WHERE date = "' + uniqueValueDates[i] +'";'
          req.session.length = uniqueValueDates.length;
          db.query(sql2, array, (err, result)=> {
               array.push(result[0].averageLevel);
               req.session.averageLevels = array
               if (array.length == req.session.length) {
                 // array.length is one more than ID of final number. Last number is null. array.length - 2 = final measurement
                 req.session.array = array
                 array.pop(); // to remove null. Array.length -1 = final measurement
                 var dates = req.session.dates
                 dates.pop();
                 for (var z = 0; z < dates.length; z++) {
                   var dateString = JSON.stringify(dates[z])
                   // let sql3 = `INSERT INTO LP (date) VALUES (`+dateString+`);`
                   // db.query (sql3, (err, result)=> {
                   // })
                   if (z+1 == dates.length) {
                     for (var q = 0; q < array.length; q++) {
                       var theLevel = array[q];
                       var idMatch = q+1;
                       console.log(idMatch);
                       let sql4 = `UPDATE LP SET salineLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
                       db.query (sql4, (err,result)=> {
                         console.log(sql4);
                       })
                     }

                   }
                 }

               }
          });
        }
      }
      getTheAverage(uniqueValueDates, array)
      res.render('index2')
      })

  app.get('/LPSearch', function(req, res) {


          var LPTemp = XLSX.readFile('IRL-LP-Temp.xlsx');
          const sheet_name_list = LPTemp.sheetNames;


          var hello = LPTemp.Sheets.Sheet1
          var allValues = []
          for(var sequence in hello) {
            allValues.push(LPTemp.Sheets.Sheet1[sequence].w)

          }
          var numberOfEntries = 0
          var totalForDay = 0.0
          var allValuesJSON = JSON.stringify(allValues);
          allValues.shift()


          console.log("Hello");
          req.session.okay = "hello"
          // ***PUT ALL VALUES INTO DB************************************************************************************************
          for (var i = 0; i < allValues.length; i++) {
            if (i % 3 == 0) {
              var theVariable = JSON.stringify(allValues[i])
              let sql = `INSERT INTO numberPointTemp (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
              db.query(sql, (err, result)=> {
              })
            }

          }
          var allValuesDates = []
          for (var i = 0; i < allValues.length; i++) {
              if (i % 3 == 0) {
                allValuesDates.push(allValues[i])
              }
          }
          function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
          }
          var uniqueValueDates = allValuesDates.filter( onlyUnique );
          var array = []
          function getTheAverage(uniqueValueDates, theArray) {
            req.session.hello = 2+3
            for (var i = 0; i < uniqueValueDates.length ; i++) {
              req.session.dates = uniqueValueDates;
              let sql2 = 'SELECT AVG(level) AS averageLevel FROM numberPointTemp WHERE date = "' + uniqueValueDates[i] +'";'
              req.session.length = uniqueValueDates.length;
              db.query(sql2, array, (err, result)=> {
                   array.push(result[0].averageLevel);
                   req.session.averageLevels = array
                   if (array.length == req.session.length) {
                     // array.length is one more than ID of final number. Last number is null. array.length - 2 = final measurement
                     req.session.array = array
                     array.pop(); // to remove null. Array.length -1 = final measurement
                     var dates = req.session.dates
                     dates.pop();
                     for (var z = 0; z < dates.length; z++) {
                       var dateString = JSON.stringify(dates[z])
                       // let sql3 = `INSERT INTO LP (date) VALUES (`+dateString+`);`
                       // db.query (sql3, (err, result)=> {
                       // })
                       if (z+1 == dates.length) {
                         for (var q = 0; q < array.length; q++) {
                           var theLevel = array[q];
                           var idMatch = q+1;
                           console.log(idMatch);
                           let sql4 = `UPDATE LP SET tempLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
                           db.query (sql4, (err,result)=> {
                             console.log(sql4);
                           })
                         }

                       }
                     }

                   }
              });
            }
          }
          getTheAverage(uniqueValueDates, array)
          res.render('index3')
          })

  app.get('/delete', function(req,res){
    let LPsql = `DROP TABLE LP;`
    db.query(LPsql, (err,result)=> {
    })
    let numberPointSQL = `DROP TABLE numberPoint;`
    db.query(numberPointSQL, (err,result)=>{
    })
    let salineSQL = `DROP TABLE numberPointSaline;`
    db.query(salineSQL, (err,result)=>{
    })
    let tempSQL = `DROP Table numberPointTemp;`
    db.query(tempSQL, (err, result)=>{
    })
    res.render('home')
  });

  app.get('/create', function(req,res) {
    let createLP = `CREATE TABLE LP (id int AUTO_INCREMENT, date VARCHAR(255), nitrateLevel FLOAT, salineLevel FLOAT, tempLevel FLOAT, PRIMARY KEY (id));`
    db.query(createLP, (err, result)=>{
      console.log(result);
    })

    let sql5 = `CREATE TABLE numberPoint (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
    db.query(sql5, (err,result)=>{
      console.log(result);
    })

    let sql6 = `CREATE TABLE numberPointSaline (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
    db.query(sql6, (err,result)=>{
      console.log(result);
    })

    let sql8 = `CREATE TABLE numberPointTemp (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
    db.query(sql8, (err,result)=>{
      console.log(result);
    })
    res.render('home')

  })

  app.get('/search', function(req, res){
    res.render('search')
  })



  app.get('/lpdata', function (req, res) {
    let sql = 'SELECT COUNT(*) FROM LP'
    db.query (sql, (err, result)=>{
      var day = result[0]["COUNT(*)"]
      var week = day - 7
      let sql2 = `SELECT * FROM LP WHERE id > ` + week + ';'
      db.query(sql2, (err, result)=>{
        var currentWeekData = []
        for (var i = 0; i < 7; i++) {
          currentWeekData.push({data:result[i].date, nitrateLevel: result[i].nitrateLevel, salineLevel: result[i].salineLevel, temp: result[i].tempLevel})
        }
        var nitrateSalineScore = 0
        var nitrateSalineScoreArray = []
        var tempScore = 0
        var tempScoreArray = []
        var score

        for (var i = 0; i < currentWeekData.length; i++) {
          function analyzeWeekData (weekData, i) {
            if (weekData[i].nitrateLevel < 6) {
                if (weekData[i].salineLevel >= 23) {
                  score = .075
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                  score = .125
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                  score = .25
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 2) {
                  score = .375
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)
                }
              } else if (weekData[i].nitrateLevel <= 9 && weekData[i].nitrateLevel >= 6) {
                if (weekData[i].salineLevel >= 23) {
                  score = .125
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                  score = .25
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                  score = .75
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 2) {
                  score = 1
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)
                }
              } else if (weekData[i].nitrateLevel < 12 && weekData[i].nitrateLevel > 9) {
                if (weekData[i].salineLevel >= 23) {
                  score = .25
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                  score = .75
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                  score = 1
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 2) {
                  score = 1.25
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)
                }
              } else if (weekData[i].nitrateLevel >= 12) {
                if (weekData[i].salineLevel >= 23) {
                  score = .5
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                  score = .875
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                  score = 1.25
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 2) {
                  score = 1.5
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)
                }
              }

            if (weekData[i].temp <= 28.4) {
                score = 0.5
                tempScoreArray.push(score)
                tempScore += score
              } else if (weekData[i].temp > 28.4 && weekData[i].temp < 31.4) {
                score = .9
                tempScoreArray.push(score)
                tempScore += score
              } else if (weekData[i].temp >= 31.4 && weekData[i].temp <= 33.4) {
                score = 1.05
                tempScoreArray.push(score)
                tempScore += score
              }else if (weekData[i].temp >=33.4 && weekData[i].temp <= 35) {
                score = 1.25
                tempScoreArray.push(score)
                tempScore += score
              } else if (weekData[i].temp > 35) {
                score = -1
                tempScoreArray.push(score)
                tempScore -= score
              }

          }


          analyzeWeekData(currentWeekData, i) //SYP{ HEE}
          if (i+1 == currentWeekData.length) {
            var oneWeekAgo = week - 7
            let sql3 = `SELECT * FROM LP WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
            db.query(sql3, (err, result)=> {
              var oneWeekAgoData = []
              for (var i = 0; i < 7; i++) {
                oneWeekAgoData.push({data:result[i].date, nitrateLevel: result[i].nitrateLevel, salineLevel: result[i].salineLevel, temp: result[i].tempLevel})
              }
              var OneWeekAgoNitrateSalineScore = 0
              var OneWeekAgoNitrateSalineScoreArray = []
              var OneWeekAgoTempScore = 0
              var OneWeekAgoTempScoreArray = []
              var points
              function analyzeWeekTwoData (weekData, i) {
                if (weekData[i].nitrateLevel < 6) {
                    if (weekData[i].salineLevel >= 23) {
                      points = .075
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)

                    } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                      points = .125
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)

                    } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                      points = .25
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)

                    } else if (weekData[i].salineLevel < 2) {
                      points = .375
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)
                    }
                  } else if (weekData[i].nitrateLevel <= 9 && weekData[i].nitrateLevel >= 6) {
                    if (weekData[i].salineLevel >= 23) {
                      points = .125
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)

                    } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                      points = .25
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)

                    } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                      points = .75
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)

                    } else if (weekData[i].salineLevel < 2) {
                      points = 1
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)
                    }
                  } else if (weekData[i].nitrateLevel < 12 && weekData[i].nitrateLevel > 9) {
                    if (weekData[i].salineLevel >= 23) {
                      points = .25
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)

                    } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                      points = .75
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)

                    } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                      points = 1
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)

                    } else if (weekData[i].salineLevel < 2) {
                      points = 1.25
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)
                    }
                  } else if (weekData[i].nitrateLevel >= 12) {
                    if (weekData[i].salineLevel >= 23) {
                      points = .5
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)

                    } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                      points = .875
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)

                    } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                      points = 1.25
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)

                    } else if (weekData[i].salineLevel < 2) {
                      points = 1.5
                      OneWeekAgoNitrateSalineScore += points
                      OneWeekAgoNitrateSalineScoreArray.push(points)
                    }
                  }

                if (weekData[i].temp <= 28.4) {
                    points = 0.5
                    OneWeekAgoTempScoreArray.push(points)
                    OneWeekAgoTempScore += points
                  } else if (weekData[i].temp > 28.4 && weekData[i].temp < 31.4) {
                    points = .9
                    OneWeekAgoTempScoreArray.push(points)
                    OneWeekAgoTempScore += points
                  } else if (weekData[i].temp >= 31.4 && weekData[i].temp <= 33.4) {
                    points = 1.05
                    OneWeekAgoTempScoreArray.push(points)
                    OneWeekAgoTempScore += points
                  }else if (weekData[i].temp >=33.4 && weekData[i].temp <= 35) {
                    points = 1.25
                    OneWeekAgoTempScoreArray.push(points)
                    OneWeekAgoTempScore += points
                  } else if (weekData[i].temp > 35) {
                    points = -1
                    OneWeekAgoTempScoreArray.push(points)
                    OneWeekAgoTempScore -= points
                  }

              }

              // console.log(oneWeekAgoData);
              for (var a = 0; a < oneWeekAgoData.length; a++) {
                analyzeWeekTwoData(oneWeekAgoData, a)
                if (a + 1 == oneWeekAgoData.length) {
                  // monthData.push({secondWeekNitrateSalineScore:OneWeekAgoNitrateSalineScore})
                  // monthData.push({secondWeekTempScoreArray:OneWeekAgoTempScoreArray})
                  // monthData.push({secondWeekTempScore:OneWeekAgoTempScore})
                  var twoWeeksAgo = oneWeekAgo - 7
                  let sql4 = `SELECT * FROM LP WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
                  // console.log(sql4);
                  db.query(sql4, (err, result)=>{
                    // console.log(result);
                    var twoWeeksAgoData = []
                    for (var u = 0; u < 7; u++) {
                      twoWeeksAgoData.push({data:result[u].date, nitrateLevel: result[u].nitrateLevel, salineLevel: result[u].salineLevel, temp: result[u].tempLevel})
                    }
                    var TwoWeeksAgoNitrateSalineScore = 0
                    var TwoWeeksAgoNitrateSalineScoreArray = []
                    var TwoWeeksAgoTempScore = 0
                    var TwoWeeksAgoTempScoreArray = []
                    var pts
                    function analyzeWeekThreeData (weekData, i) {
                      if (weekData[i].nitrateLevel < 6) {
                          if (weekData[i].salineLevel >= 23) {
                            pts = .075
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                          } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                            pts = .125
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                          } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                            pts = .25
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                          } else if (weekData[i].salineLevel < 2) {
                            pts = .375
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)
                          }
                        } else if (weekData[i].nitrateLevel <= 9 && weekData[i].nitrateLevel >= 6) {
                          if (weekData[i].salineLevel >= 23) {
                            pts = .125
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                          } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                            pts = .25
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                          } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                            pts = .75
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                          } else if (weekData[i].salineLevel < 2) {
                            pts = 1
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)
                          }
                        } else if (weekData[i].nitrateLevel < 12 && weekData[i].nitrateLevel > 9) {
                          if (weekData[i].salineLevel >= 23) {
                            pts = .25
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                          } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                            pts = .75
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                          } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                            pts = 1
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                          } else if (weekData[i].salineLevel < 2) {
                            pts = 1.25
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)
                          }
                        } else if (weekData[i].nitrateLevel >= 12) {
                          if (weekData[i].salineLevel >= 23) {
                            pts = .5
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                          } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                            pts = .875
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                          } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                            pts = 1.25
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                          } else if (weekData[i].salineLevel < 2) {
                            pts = 1.5
                            TwoWeeksAgoNitrateSalineScore += pts
                            TwoWeeksAgoNitrateSalineScoreArray.push(pts)
                          }
                        }

                      if (weekData[i].temp <= 28.4) {
                          pts = 0.5
                          TwoWeeksAgoTempScoreArray.push(pts)
                          TwoWeeksAgoTempScore += pts
                        } else if (weekData[i].temp > 28.4 && weekData[i].temp < 31.4) {
                          pts = .9
                          TwoWeeksAgoTempScoreArray.push(pts)
                          TwoWeeksAgoTempScore += pts
                        } else if (weekData[i].temp >= 31.4 && weekData[i].temp <= 33.4) {
                          pts = 1.05
                          TwoWeeksAgoTempScoreArray.push(pts)
                          TwoWeeksAgoTempScore += pts
                        }else if (weekData[i].temp >=33.4 && weekData[i].temp <= 35) {
                          pts = 1.25
                          TwoWeeksAgoTempScoreArray.push(pts)
                          TwoWeeksAgoTempScore += pts
                        } else if (weekData[i].temp > 35) {
                          pts = -1
                          TwoWeeksAgoTempScoreArray.push(pts)
                          TwoWeeksAgoTempScore -= pts
                        }

                    }

                    for (var rr = 0; rr < twoWeeksAgoData.length; rr++) {
                      analyzeWeekThreeData(twoWeeksAgoData, rr)
                      if (rr+ 1 == twoWeeksAgoData.length) {
                        var monthData = {
                          firstWeekNitrateSalineScoreArray:nitrateSalineScoreArray,
                          firstWeekNitrateSalineScore:nitrateSalineScore,
                          firstWeekTempScoreArray:tempScoreArray,
                          firstWeekTempScore:tempScore,
                          secondWeekNitrateSalineScoreArray:OneWeekAgoNitrateSalineScoreArray,
                          secondWeekNitrateSalineScore:OneWeekAgoNitrateSalineScore,
                          secondWeekTempScoreArray:OneWeekAgoTempScoreArray,
                          secondWeekTempScore:OneWeekAgoTempScore,
                          thirdWeekNitrateSalineScoreArray:TwoWeeksAgoNitrateSalineScoreArray,
                          thirdWeekNitrateSalineScore:TwoWeeksAgoNitrateSalineScore,
                          thirdWeekTempScoreArray:TwoWeeksAgoTempScoreArray,
                          thirdWeekTempScore:TwoWeeksAgoTempScore
                        }
                        function slopeMaker (first, second, third) {
                          var addedFirstValues = second - first
                          var firstSlope = addedFirstValues / 2
                          var addedSecondValues = third - second
                          var secondSlope = addedSecondValues / 2
                          var finalAddedValues = firstSlope + secondSlope
                          var finalSlope = finalAddedValues / 2
                          return finalSlope
                        }

                        var nitrateSalineSlope = slopeMaker(monthData.firstWeekNitrateSalineScore, monthData.secondWeekNitrateSalineScore, monthData.thirdWeekNitrateSalineScore)
                        console.log(nitrateSalineSlope);

                        var tempSlope = slopeMaker(monthData.firstWeekTempScore, monthData.secondWeekTempScore, monthData.thirdWeekTempScore)
                        console.log(tempSlope);
                        var chanceOfAnAlgaeBloom


                      if (monthData.firstWeekNitrateSalineScore >= 6.85) {
                          if (monthData.firstWeekTempScore >= 7.15) {
                            if (nitrateSalineSlope > 0) {
                              if (tempSlope >= 0) {
                                chanceOfAnAlgaeBloom = true
                              } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                chanceOfAnAlgaeBloom = true
                              } else {
                                chanceOfAnAlgaeBloom = false
                              }
                            } else if (monthData.firstWeekNitrateSalineScore - nitrateSalineSlope >= 6.85) {
                              if (tempSlope >= 0) {
                                chanceOfAnAlgaeBloom = true
                              } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                chanceOfAnAlgaeBloom = true
                              } else {
                                chanceOfAnAlgaeBloom = false
                              }
                            } else {
                              chanceOfAnAlgaeBloom = false
                            }
                          } else if (monthData.firstWeekTempScore >= 7 && monthData.secondWeekTempScore >= 7 &&  monthData.thirdWeekTempScore >=7) {
                            if (nitrateSalineSlope > 0) {
                              if (tempSlope >= 0) {
                                chanceOfAnAlgaeBloom = true
                              } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                chanceOfAnAlgaeBloom = true
                              } else {
                                chanceOfAnAlgaeBloom = false
                              }
                            } else if (monthData.firstWeekNitrateSalineScore - nitrateSalineSlope >= 6.85) {
                              if (tempSlope >= 0) {
                                chanceOfAnAlgaeBloom = true
                              } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                chanceOfAnAlgaeBloom = true
                              } else {
                                chanceOfAnAlgaeBloom = false
                              }
                            } else {
                              chanceOfAnAlgaeBloom = false
                            }
                          } else {
                            chanceOfAnAlgaeBloom = false
                          }
                        } else if (monthData.firstWeekNitrateSalineScore >= 6.25 && monthData.secondWeekNitrateSalineScore >= 6.25 && monthData.thirdWeekNitrateSalineScore >=6.25) {
                          if (monthData.firstWeekTempScore >= 7.15) {
                            if (nitrateSalineSlope > 0) {
                              if (tempSlope >= 0) {
                                chanceOfAnAlgaeBloom = true
                              } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                chanceOfAnAlgaeBloom = true
                              } else {
                                chanceOfAnAlgaeBloom = false
                              }
                            } else if (monthData.firstWeekNitrateSalineScore - nitrateSalineSlope >= 6.85) {
                              if (tempSlope >= 0) {
                                chanceOfAnAlgaeBloom = true
                              } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                chanceOfAnAlgaeBloom = true
                              } else {
                                chanceOfAnAlgaeBloom = false
                              }
                            } else {
                              chanceOfAnAlgaeBloom = false
                            }
                          } else if (monthData.firstWeekTempScore >= 7 && monthData.secondWeekTempScore >= 7 &&  monthData.thirdWeekTempScore >=7) {
                            if (nitrateSalineSlope >= 0) {
                              if (tempSlope >= 0) {
                                chanceOfAnAlgaeBloom = true
                              } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                chanceOfAnAlgaeBloom = true
                              } else {
                                chanceOfAnAlgaeBloom = false
                              }
                            } else if (monthData.firstWeekNitrateSalineScore - nitrateSalineSlope >= 6.85) {
                              if (tempSlope >= 0) {
                                chanceOfAnAlgaeBloom = true
                              } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                chanceOfAnAlgaeBloom = true
                              } else {
                                chanceOfAnAlgaeBloom = false
                              }
                            } else {
                              chanceOfAnAlgaeBloom = false
                            }
                          } else {
                            chanceOfAnAlgaeBloom = false
                          }
                        } else {
                          chanceOfAnAlgaeBloom = false
                        }


                    var StringChanceOfAnAlgaeBloom
                    if (chanceOfAnAlgaeBloom) {
                      StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                    } else if (!chanceOfAnAlgaeBloom) {
                      StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                    }
                    var dataForNitrate = []
                    var twoWeeksAgoAndOneWeekAgoData = twoWeeksAgoData.concat(oneWeekAgoData)
                    var allThreeWeeksData = twoWeeksAgoAndOneWeekAgoData.concat(currentWeekData)

                    for (var i = 0; i < 21; i++) {
                      dataForNitrate.push({time:allThreeWeeksData[i].data, temperature: allThreeWeeksData[i].nitrateLevel})
                    }

                    var dataForSaline = []
                    for (var i = 0; i < 21; i++) {
                      dataForSaline.push({time:allThreeWeeksData[i].data, saline: allThreeWeeksData[i].salineLevel})
                    }

                    var londonTempData = {
                    // city: 'Florida',
                    // unit: 'celsius',
                      dataPoints: dataForNitrate
                    }

                    var salineLevelDataForGraph = {
                    // city: 'Florida',
                    // unit: 'celsius',
                      dataPoints: dataForSaline
                    }


                    var dataFortheTemp = []
                    for (var i = 0; i < 21; i++) {
                      dataFortheTemp.push({time:allThreeWeeksData[i].data, theTemp: allThreeWeeksData[i].temp})
                    }

                    var theTempDataForGraph = {
                    // city: 'Florida',
                    // unit: 'celsius',
                      dataPoints: dataFortheTemp
                    }



                    //for Nitrate
                    app.get('/getTemperature', function(req,res){
                    res.send(londonTempData);
                  });
                    app.get('/addTemperature', function(req,res){
                    var temp = parseInt(req.query.temperature);
                    var time = parseInt(req.query.time);
                    if(temp && time && !isNaN(temp) && !isNaN(time)){
                      var newDataPoint = {
                        temperature: temp,
                        time: time
                      };
                      londonTempData.dataPoints.push(newDataPoint);
                      pusher.trigger('london-temp-chart', 'new-temperature', {
                        dataPoint: newDataPoint
                      });
                      res.send({success:true});
                    }else{
                      res.send({success:false, errorMessage: 'Invalid Query Paramaters, required - temperature & time.'});
                    }
                  });

                    //forSaline
                    app.get('/getSaline', function(req,res){
                      res.send(salineLevelDataForGraph);
                    });
                    app.get('/addSaline', function(req,res){
                      var saline = parseInt(req.query.saline);
                      var time = parseInt(req.query.time);
                      if(saline && time && !isNaN(saline) && !isNaN(time)){
                        var newDataPoint = {
                          saline: saline,
                          time: time
                        };
                        salineLevelDataForGraph.dataPoints.push(newDataPoint);
                        pusher.trigger('salineLevelDataForGraph-chart', 'new-saline', {
                          dataPoint: newDataPoint
                        });
                        res.send({success:true});
                      }else{
                        res.send({success:false, errorMessage: 'Invalid Query Paramaters, required - saline & time.'});
                      }
                    });

                    //forSaline
                    app.get('/gettheTemp', function(req,res){
                      res.send(theTempDataForGraph);
                    });
                    app.get('/addtheTemp', function(req,res){
                      var theTemp = parseInt(req.query.theTemp);
                      var time = parseInt(req.query.time);
                      if(theTemp && time && !isNaN(theTemp) && !isNaN(time)){
                        var newDataPoint = {
                          theTemp: theTemp,
                          time: time
                        };
                        theTempDataForGraph.dataPoints.push(newDataPoint);
                        pusher.trigger('theTempDataForGraph-chart', 'new-theTemp', {
                          dataPoint: newDataPoint
                        });
                        res.send({success:true});
                      }else{
                        res.send({success:false, errorMessage: 'Invalid Query Paramaters, required - theTemp & time.'});
                      }
                    });

                    res.render('lpdata', {monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})
                    // console.log(twoWeeksAgoData);
                    // console.log(oneWeekAgoData);
                    // console.log(currentWeekData);



                      } //ends if (rr+ 1 == twoWeeksAgoData.length) {
                    } //ends final for loop
                  }) //ends a query
                } // ends if (a + 1 == oneWeekAgoData.length) {
              } // ends  for (var a = 0; a < oneWeekAgoData.length; a++) {
            }) // ends db.query(sql3, (err, result)=> {
          } // ends if (i+1 == currentWeekData.length) {
        } // ends for (var i = 0; i < currentWeekData.length; i++) {
      }) // ends db.query(sql2, (err, result)=>{
    }) // ends   db.query (sql, (err, result)=>{
  }); // ends app.get('/lpdata', function (req, res) {



  app.get('/test', function (req, res) {
    res.render('test')
  })

  app.post('/date', function(req, res){
    let date = req.body.date;
    console.log(date);
    let sql10 = `SELECT * FROM LP WHERE date ="` + date + `";`
    db.query (sql10, (err, result)=>{
      console.log(result);
      var specificDayNitrate = result[0].nitrateLevel;
      var specificDayDate = result[0].date;
      var specificDaySaline = result[0].salineLevel;
      var specificDayTemp = result[0].tempLevel;

      // db.query (sql, (err, result)=>{
      var day = result[0].id
      console.log(day);
      var week = day - 7
      let sql2 = `SELECT * FROM LP WHERE id > ` + week + ' && id <= '+day+';'
        db.query(sql2, (err, result)=>{
          var currentWeekData = []

          for (var i = 0; i < 7; i++) {
            currentWeekData.push({data:result[i].date, nitrateLevel: result[i].nitrateLevel, salineLevel: result[i].salineLevel, temp: result[i].tempLevel})
          }
          var nitrateSalineScore = 0
          var nitrateSalineScoreArray = []
          var tempScore = 0
          var tempScoreArray = []
          var score
          for (var i = 0; i < currentWeekData.length; i++) {
            function analyzeWeekData (weekData, i) {
              if (weekData[i].nitrateLevel < 6) {
                  if (weekData[i].salineLevel >= 23) {
                    score = .075
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                    score = .125
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                    score = .25
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 2) {
                    score = .375
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)
                  }
                } else if (weekData[i].nitrateLevel <= 9 && weekData[i].nitrateLevel >= 6) {
                  if (weekData[i].salineLevel >= 23) {
                    score = .125
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                    score = .25
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                    score = .75
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 2) {
                    score = 1
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)
                  }
                } else if (weekData[i].nitrateLevel < 12 && weekData[i].nitrateLevel > 9) {
                  if (weekData[i].salineLevel >= 23) {
                    score = .25
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                    score = .75
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                    score = 1
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 2) {
                    score = 1.25
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)
                  }
                } else if (weekData[i].nitrateLevel >= 12) {
                  if (weekData[i].salineLevel >= 23) {
                    score = .5
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                    score = .875
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                    score = 1.25
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 2) {
                    score = 1.5
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)
                  }
                }

              if (weekData[i].temp <= 28.4) {
                  score = 0.5
                  tempScoreArray.push(score)
                  tempScore += score
                } else if (weekData[i].temp > 28.4 && weekData[i].temp < 31.4) {
                  score = .9
                  tempScoreArray.push(score)
                  tempScore += score
                } else if (weekData[i].temp >= 31.4 && weekData[i].temp <= 33.4) {
                  score = 1.05
                  tempScoreArray.push(score)
                  tempScore += score
                }else if (weekData[i].temp >=33.4 && weekData[i].temp <= 35) {
                  score = 1.25
                  tempScoreArray.push(score)
                  tempScore += score
                } else if (weekData[i].temp > 35) {
                  score = -1
                  tempScoreArray.push(score)
                  tempScore -= score
                }

            }


            analyzeWeekData(currentWeekData, i)
            if (i+1 == currentWeekData.length) {
              console.log(nitrateSalineScore);
              console.log(nitrateSalineScoreArray);
              console.log(tempScore);
              console.log(tempScoreArray);
              var oneWeekAgo = week - 7
              let sql3 = `SELECT * FROM LP WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
              db.query(sql3, (err, result)=> {
                var oneWeekAgoData = []
                for (var i = 0; i < 7; i++) {
                  oneWeekAgoData.push({data:result[i].date, nitrateLevel: result[i].nitrateLevel, salineLevel: result[i].salineLevel, temp: result[i].tempLevel})
                }
                var OneWeekAgoNitrateSalineScore = 0
                var OneWeekAgoNitrateSalineScoreArray = []
                var OneWeekAgoTempScore = 0
                var OneWeekAgoTempScoreArray = []
                var points


                function analyzeWeekTwoData (weekData, i) {
                  if (weekData[i].nitrateLevel < 6) {
                      if (weekData[i].salineLevel >= 23) {
                        points = .075
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)

                      } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                        points = .125
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)

                      } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                        points = .25
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)

                      } else if (weekData[i].salineLevel < 2) {
                        points = .375
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)
                      }
                    } else if (weekData[i].nitrateLevel <= 9 && weekData[i].nitrateLevel >= 6) {
                      if (weekData[i].salineLevel >= 23) {
                        points = .125
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)

                      } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                        points = .25
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)

                      } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                        points = .75
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)

                      } else if (weekData[i].salineLevel < 2) {
                        points = 1
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)
                      }
                    } else if (weekData[i].nitrateLevel < 12 && weekData[i].nitrateLevel > 9) {
                      if (weekData[i].salineLevel >= 23) {
                        points = .25
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)

                      } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                        points = .75
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)

                      } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                        points = 1
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)

                      } else if (weekData[i].salineLevel < 2) {
                        points = 1.25
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)
                      }
                    } else if (weekData[i].nitrateLevel >= 12) {
                      if (weekData[i].salineLevel >= 23) {
                        points = .5
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)

                      } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                        points = .875
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)

                      } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                        points = 1.25
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)

                      } else if (weekData[i].salineLevel < 2) {
                        points = 1.5
                        OneWeekAgoNitrateSalineScore += points
                        OneWeekAgoNitrateSalineScoreArray.push(points)
                      }
                    }

                  if (weekData[i].temp <= 28.4) {
                      points = 0.5
                      OneWeekAgoTempScoreArray.push(points)
                      OneWeekAgoTempScore += points
                    } else if (weekData[i].temp > 28.4 && weekData[i].temp < 31.4) {
                      points = .9
                      OneWeekAgoTempScoreArray.push(points)
                      OneWeekAgoTempScore += points
                    } else if (weekData[i].temp >= 31.4 && weekData[i].temp <= 33.4) {
                      points = 1.05
                      OneWeekAgoTempScoreArray.push(points)
                      OneWeekAgoTempScore += points
                    }else if (weekData[i].temp >=33.4 && weekData[i].temp <= 35) {
                      points = 1.25
                      OneWeekAgoTempScoreArray.push(points)
                      OneWeekAgoTempScore += points
                    } else if (weekData[i].temp > 35) {
                      points = -1
                      OneWeekAgoTempScoreArray.push(points)
                      OneWeekAgoTempScore -= points
                    }

                }
                for (var a = 0; a < oneWeekAgoData.length; a++) {
                  analyzeWeekTwoData(oneWeekAgoData, a)
                  if (a + 1 == oneWeekAgoData.length) {
                    // monthData.push({secondWeekNitrateSalineScore:OneWeekAgoNitrateSalineScore})
                    // monthData.push({secondWeekTempScoreArray:OneWeekAgoTempScoreArray})
                    // monthData.push({secondWeekTempScore:OneWeekAgoTempScore})
                    var twoWeeksAgo = oneWeekAgo - 7
                    let sql4 = `SELECT * FROM LP WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
                    // console.log(sql4);
                    db.query(sql4, (err, result)=>{
                      // console.log(result);
                      var twoWeeksAgoData = []
                      for (var u = 0; u < 7; u++) {
                        twoWeeksAgoData.push({data:result[u].date, nitrateLevel: result[u].nitrateLevel, salineLevel: result[u].salineLevel, temp: result[u].tempLevel})
                      }



                      var TwoWeeksAgoNitrateSalineScore = 0
                      var TwoWeeksAgoNitrateSalineScoreArray = []
                      var TwoWeeksAgoTempScore = 0
                      var TwoWeeksAgoTempScoreArray = []
                      var pts
                      function analyzeWeekThreeData (weekData, i) {
                        if (weekData[i].nitrateLevel < 6) {
                            if (weekData[i].salineLevel >= 23) {
                              pts = .075
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                            } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                              pts = .125
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                            } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                              pts = .25
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                            } else if (weekData[i].salineLevel < 2) {
                              pts = .375
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)
                            }
                          } else if (weekData[i].nitrateLevel <= 9 && weekData[i].nitrateLevel >= 6) {
                            if (weekData[i].salineLevel >= 23) {
                              pts = .125
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                            } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                              pts = .25
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                            } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                              pts = .75
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                            } else if (weekData[i].salineLevel < 2) {
                              pts = 1
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)
                            }
                          } else if (weekData[i].nitrateLevel < 12 && weekData[i].nitrateLevel > 9) {
                            if (weekData[i].salineLevel >= 23) {
                              pts = .25
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                            } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                              pts = .75
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                            } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                              pts = 1
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                            } else if (weekData[i].salineLevel < 2) {
                              pts = 1.25
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)
                            }
                          } else if (weekData[i].nitrateLevel >= 12) {
                            if (weekData[i].salineLevel >= 23) {
                              pts = .5
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                            } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                              pts = .875
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                            } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                              pts = 1.25
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)

                            } else if (weekData[i].salineLevel < 2) {
                              pts = 1.5
                              TwoWeeksAgoNitrateSalineScore += pts
                              TwoWeeksAgoNitrateSalineScoreArray.push(pts)
                            }
                          }

                        if (weekData[i].temp <= 28.4) {
                            pts = 0.5
                            TwoWeeksAgoTempScoreArray.push(pts)
                            TwoWeeksAgoTempScore += pts
                          } else if (weekData[i].temp > 28.4 && weekData[i].temp < 31.4) {
                            pts = .9
                            TwoWeeksAgoTempScoreArray.push(pts)
                            TwoWeeksAgoTempScore += pts
                          } else if (weekData[i].temp >= 31.4 && weekData[i].temp <= 33.4) {
                            pts = 1.05
                            TwoWeeksAgoTempScoreArray.push(pts)
                            TwoWeeksAgoTempScore += pts
                          }else if (weekData[i].temp >=33.4 && weekData[i].temp <= 35) {
                            pts = 1.25
                            TwoWeeksAgoTempScoreArray.push(pts)
                            TwoWeeksAgoTempScore += pts
                          } else if (weekData[i].temp > 35) {
                            pts = -1
                            TwoWeeksAgoTempScoreArray.push(pts)
                            TwoWeeksAgoTempScore -= pts
                          }

                      }
                      for (var rr = 0; rr < twoWeeksAgoData.length; rr++) {
                        analyzeWeekThreeData(twoWeeksAgoData, rr)
                        if (rr+ 1 == twoWeeksAgoData.length) {
                          var monthData = {
                            firstWeekNitrateSalineScoreArray:nitrateSalineScoreArray,
                            firstWeekNitrateSalineScore:nitrateSalineScore,
                            firstWeekTempScoreArray:tempScoreArray,
                            firstWeekTempScore:tempScore,
                            secondWeekNitrateSalineScoreArray:OneWeekAgoNitrateSalineScoreArray,
                            secondWeekNitrateSalineScore:OneWeekAgoNitrateSalineScore,
                            secondWeekTempScoreArray:OneWeekAgoTempScoreArray,
                            secondWeekTempScore:OneWeekAgoTempScore,
                            thirdWeekNitrateSalineScoreArray:TwoWeeksAgoNitrateSalineScoreArray,
                            thirdWeekNitrateSalineScore:TwoWeeksAgoNitrateSalineScore,
                            thirdWeekTempScoreArray:TwoWeeksAgoTempScoreArray,
                            thirdWeekTempScore:TwoWeeksAgoTempScore
                          }
                          function slopeMaker (first, second, third) {
                            var addedFirstValues = second - first
                            var firstSlope = addedFirstValues / 2
                            var addedSecondValues = third - second
                            var secondSlope = addedSecondValues / 2
                            var finalAddedValues = firstSlope + secondSlope
                            var finalSlope = finalAddedValues / 2
                            return finalSlope
                          }

                          var nitrateSalineSlope = slopeMaker(monthData.firstWeekNitrateSalineScore, monthData.secondWeekNitrateSalineScore, monthData.thirdWeekNitrateSalineScore)
                          console.log("NitrateSalineSlope Is" + nitrateSalineSlope);

                          var tempSlope = slopeMaker(monthData.firstWeekTempScore, monthData.secondWeekTempScore, monthData.thirdWeekTempScore)
                          console.log("TempSlope Is" + tempSlope);
                          var chanceOfAnAlgaeBloom


                        if (monthData.firstWeekNitrateSalineScore >= 6.85) {
                            if (monthData.firstWeekTempScore >= 7.15) {
                              if (nitrateSalineSlope > 0) {
                                if (tempSlope >= 0) {
                                  chanceOfAnAlgaeBloom = true
                                } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                  chanceOfAnAlgaeBloom = true
                                } else {
                                  chanceOfAnAlgaeBloom = false
                                }
                              } else if (monthData.firstWeekNitrateSalineScore - nitrateSalineSlope >= 6.85) {
                                if (tempSlope >= 0) {
                                  chanceOfAnAlgaeBloom = true
                                } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                  chanceOfAnAlgaeBloom = true
                                } else {
                                  chanceOfAnAlgaeBloom = false
                                }
                              } else {
                                chanceOfAnAlgaeBloom = false
                              }
                            } else if (monthData.firstWeekTempScore >= 7 && monthData.secondWeekTempScore >= 7 &&  monthData.thirdWeekTempScore >=7) {
                              if (nitrateSalineSlope > 0) {
                                if (tempSlope >= 0) {
                                  chanceOfAnAlgaeBloom = true
                                } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                  chanceOfAnAlgaeBloom = true
                                } else {
                                  chanceOfAnAlgaeBloom = false
                                }
                              } else if (monthData.firstWeekNitrateSalineScore - nitrateSalineSlope >= 6.85) {
                                if (tempSlope >= 0) {
                                  chanceOfAnAlgaeBloom = true
                                } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                  chanceOfAnAlgaeBloom = true
                                } else {
                                  chanceOfAnAlgaeBloom = false
                                }
                              } else {
                                chanceOfAnAlgaeBloom = false
                              }
                            } else {
                              chanceOfAnAlgaeBloom = false
                            }
                          } else if (monthData.firstWeekNitrateSalineScore >= 6.25 && monthData.secondWeekNitrateSalineScore >= 6.25 && monthData.thirdWeekNitrateSalineScore >=6.25) {
                            if (monthData.firstWeekTempScore >= 7.15) {
                              if (nitrateSalineSlope > 0) {
                                if (tempSlope >= 0) {
                                  chanceOfAnAlgaeBloom = true
                                } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                  chanceOfAnAlgaeBloom = true
                                } else {
                                  chanceOfAnAlgaeBloom = false
                                }
                              } else if (monthData.firstWeekNitrateSalineScore - nitrateSalineSlope >= 6.85) {
                                if (tempSlope >= 0) {
                                  chanceOfAnAlgaeBloom = true
                                } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                  chanceOfAnAlgaeBloom = true
                                } else {
                                  chanceOfAnAlgaeBloom = false
                                }
                              } else {
                                chanceOfAnAlgaeBloom = false
                              }
                            } else if (monthData.firstWeekTempScore >= 7 && monthData.secondWeekTempScore >= 7 &&  monthData.thirdWeekTempScore >=7) {
                              if (nitrateSalineSlope >= 0) {
                                if (tempSlope >= 0) {
                                  chanceOfAnAlgaeBloom = true
                                } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                  chanceOfAnAlgaeBloom = true
                                } else {
                                  chanceOfAnAlgaeBloom = false
                                }
                              } else if (monthData.firstWeekNitrateSalineScore - nitrateSalineSlope >= 6.85) {
                                if (tempSlope >= 0) {
                                  chanceOfAnAlgaeBloom = true
                                } else if (monthData.firstWeekTempScore - tempSlope >= 7.15) {
                                  chanceOfAnAlgaeBloom = true
                                } else {
                                  chanceOfAnAlgaeBloom = false
                                }
                              } else {
                                chanceOfAnAlgaeBloom = false
                              }
                            } else {
                              chanceOfAnAlgaeBloom = false
                            }
                          } else {
                            chanceOfAnAlgaeBloom = false
                          }


                      var StringChanceOfAnAlgaeBloom
                      if (chanceOfAnAlgaeBloom) {
                        StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                      } else if (!chanceOfAnAlgaeBloom) {
                        StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                      }
                      var dataForNitrateForSearch = []
                      var twoWeeksAgoAndOneWeekAgoData = twoWeeksAgoData.concat(oneWeekAgoData)
                      var allThreeWeeksData = twoWeeksAgoAndOneWeekAgoData.concat(currentWeekData)

                      for (var i = 0; i < 21; i++) {
                        dataForNitrateForSearch.push({timeForSearch:allThreeWeeksData[i].data, temperatureForSearch: allThreeWeeksData[i].nitrateLevel})
                      }

                      var dataForSalineForSearch = []
                      for (var i = 0; i < 21; i++) {
                        dataForSalineForSearch.push({timeForSearch:allThreeWeeksData[i].data, salineForSearch: allThreeWeeksData[i].salineLevel})
                      }
                    //
                      req.session.londonTempDataForSearch = {
                      // city: 'Florida',
                      // unit: 'celsius',
                        dataPoints: dataForNitrateForSearch
                      }
                    //
                      req.session.salineForSearchLevelDataForGraph = {
                      // city: 'Florida',
                      // unit: 'celsius',
                        dataPoints: dataForSalineForSearch
                      }
                    //
                    //
                      var dataFortheTempForSearch = []
                      for (var i = 0; i < 21; i++) {
                        dataFortheTempForSearch.push({timeForSearch:allThreeWeeksData[i].data, theTempForSearch: allThreeWeeksData[i].temp})
                      }

                      req.session.theTempDataForGraphForSearch = {
                      // city: 'Florida',
                      // unit: 'celsius',
                        dataPoints: dataFortheTempForSearch
                      }



                     // for Nitrate
                     req.session.resetCodeForNitrateForSearch = ''
                    app.get('/getTemperatureForSearch'+req.session.resetCodeForNitrateForSearch, function(req,res){
                      res.send(req.session.londonTempDataForSearch);
                    });
                      app.get('/addTemperatureForSearch', function(req,res){
                      var tempForSearch = parseInt(req.query.temperatureForSearch);
                      var timeForSearch = parseInt(req.query.timeForSearch);
                      if(temp && time && !isNaN(tempForSearch) && !isNaN(timeForSearch)){
                        var newDataPoint = {
                          temperature: tempForSearch,
                          time: timeForSearch
                        };
                        londonTempData.dataPoints.push(newDataPoint);
                        pusher.trigger('london-tempForSearch-chart', 'new-temperatureForSearch', {
                          dataPoint: newDataPoint
                        });
                        res.send({success:true});
                      }else{
                        res.send({success:false, errorMessage: 'Invalid Query Paramaters, required - temperatureForSearch & timeForSearch.'});
                      }
                    });

                      //forSaline
                      req.session.resetCodeForSalineForSearch = ''
                      app.get('/getSalineForSearch'+req.session.resetCodeForSalineForSearch, function(req,res){
                        res.send(req.session.salineForSearchLevelDataForGraph);
                      });
                      app.get('/addSalineForSearch', function(req,res){
                        var salineForSearch = parseInt(req.query.salineForSearch);
                        var timeForSearch = parseInt(req.query.timeForSearch);
                        if(salineForSearch && timeForSearch && !isNaN(salineForSearch) && !isNaN(timeForSearch)){
                          var newDataPoint = {
                            saline: salineForSearch,
                            time: timeForSearch
                          };
                          req.session.salineForSearchLevelDataForGraph.dataPoints.push(newDataPoint);
                          pusher.trigger('salineForSearchLevelDataForGraph-chart', 'new-salineForSearch', {
                            dataPoint: newDataPoint
                          });
                          res.send({success:true});
                        }else{
                          res.send({success:false, errorMessage: 'Invalid Query Paramaters, required - salineForSearch & timeForSearch.'});
                        }
                      });
                    //
                      //the temp
                      req.session.resetCodeFortheTempForSearch = ''
                      app.get('/gettheTempForSearch'+req.session.resetCodeFortheTempForSearch, function(req,res){
                        res.send(req.session.theTempDataForGraphForSearch);
                      });
                      app.get('/addtheTempForSearch', function(req,res){
                        var theTempForSearch = parseInt(req.query.theTempForSearch);
                        var timeForSearch = parseInt(req.query.timeForSearchForSearch);
                        if(theTemp && time && !isNaN(theTempForSearch) && !isNaN(timeForSearch)){
                          var newDataPoint = {
                            theTemp: theTempForSearch,
                            time: timeForSearch
                          };
                          theTempDataForGraph.dataPoints.push(newDataPoint);
                          pusher.trigger('theTempForSearchDataForGraph-chart', 'new-theTempForSearch', {
                            dataPoint: newDataPoint
                          });
                          res.send({success:true});
                        }else{
                          res.send({success:false, errorMessage: 'Invalid Query Paramaters, required - theTempForSearch & timeForSearch.'});
                        }
                      });
                    console.log(monthData);
                    res.render('index4', {nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})

                      // console.log(twoWeeksAgoData);
                      // console.log(oneWeekAgoData);
                      // console.log(currentWeekData);



                        } //ends if (rr+ 1 == twoWeeksAgoData.length) {
                      } //ends final for loop

//Hello++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// HELLO======================================================================
                    })
                  }
                }




              })
            }

          }



        })        //ends db.query(sql2, (err, result)=>{



    })
  });

  app.get('/resetSearch', function(req, res,) {
    req.session.resetCodeForSalineForSearch = "reset"
    req.session.resetCodeForNitrateForSearch = "reset"
    req.session.resetCodeFortheTempForSearch = "reset"

    app.get('/getSalineForSearch'+req.session.resetCodeForSalineForSearch, function(req,res){
      res.send(req.session.salineForSearchLevelDataForGraph);
    });
   app.get('/getTemperatureForSearch'+req.session.resetCodeForNitrateForSearch, function(req,res){
     res.send(req.session.londonTempDataForSearch);
   });
   app.get('/gettheTempForSearch'+req.session.resetCodeFortheTempForSearch, function(req,res){
     res.send(req.session.londonTempDataForSearch);
   });
    res.redirect('/')
  })











};
