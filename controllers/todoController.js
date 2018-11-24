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
    // console.log(allValues.length);
    var numberOfEntries = 0
    var totalForDay = 0.0
    var allValuesJSON = JSON.stringify(allValues);
    allValues.shift()


    console.log("Hello");
    req.session.okay = "hello"
    // ***PUT ALL VALUES INTO DB************************************************************************************************
    for (var i = 0; i < allValues.length; i++) {
      // console.log("All Values == "+ allValues.length); IS WOrkING
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
    console.log(allValuesDates);


    uniqueValueDates = allValuesDates.filter( function( item, index, inputArray ) {
           return inputArray.indexOf(item) == index;
    });

    console.log(uniqueValueDates);


    // console.log(uniqueValueDates);
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
                     // console.log("q = "+ q);
                     var theLevel = array[q];
                     var idMatch = q+1;
                     // console.log(idMatch);
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
  app.get('/deleteLP', function(req,res){
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
  app.get('/createLP', function(req,res) {
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
                  score = .125
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                  score = .25
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                  score = .375
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 2) {
                  score = .5
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)
                }
              } else if (weekData[i].nitrateLevel <= 9 && weekData[i].nitrateLevel >= 6) {
                if (weekData[i].salineLevel >= 23) {
                  score = .25
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                  score = .375
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                  score = 1
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 2) {
                  score = 1.5
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)
                }
              } else if (weekData[i].nitrateLevel < 12 && weekData[i].nitrateLevel > 9) {
                if (weekData[i].salineLevel >= 23) {
                  score = .5
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
                  score = 1.5
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)
                }
              } else if (weekData[i].nitrateLevel >= 12) {
                if (weekData[i].salineLevel >= 23) {
                  score = .75
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                  score = 1
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                  score = 1.25
                  nitrateSalineScore += score
                  nitrateSalineScoreArray.push(score)

                } else if (weekData[i].salineLevel < 2) {
                  score = 2
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
                        var aChanceOfAnAlgaeBloom

                        var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)

                    var alert
                    var StringChanceOfAnAlgaeBloom
                    if (chanceOfAnAlgaeBloom) {
                      StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                      alert = "alert-danger"
                    } else if (!chanceOfAnAlgaeBloom) {
                      StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                      alert = "alert-success"
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

                    let sql10 = `SELECT * FROM LP WHERE id ="` + day + `";`
                    console.log(sql10);
                    db.query(sql10, (err, result)=>{
                      var conditions = result[0]
                      res.render('lpdata', {conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})

                    });


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
                          var aChanceOfAnAlgaeBloom
                          var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)
                      var StringChanceOfAnAlgaeBloom
                      var alert
                      if (chanceOfAnAlgaeBloom) {
                        StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                        alert = 'alert-danger'
                      } else if (!chanceOfAnAlgaeBloom) {
                        StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                        alert = 'alert-success'
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
                    res.render('index4', {alert: alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})

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

  app.get('/map', function(req, res) {
    res.render('map')
  })


//++++++++++++++++++++++++++++++++++++++ FP data


  app.get('/fp', function(req, res) {


    var FPNitrate = XLSX.readFile('IRL-FP-Nitrate.xlsx');
    const sheet_name_list = FPNitrate.sheetNames;
    var hello = FPNitrate.Sheets.Sheet1
    var allValues = []
    for(var sequence in hello) {
      allValues.push(FPNitrate.Sheets.Sheet1[sequence].w)
    }
    console.log(allValues.length);
    var numberOfEntries = 0
    var totalForDay = 0.0
    var allValuesJSON = JSON.stringify(allValues);
    allValues.shift()


    console.log("Hello");
    req.session.okay = "hello"
    // ***PUT ALL VALUES INTO DB************************************************************************************************
    for (var i = 0; i < allValues.length; i++) {
      // console.log("All Values == "+ allValues.length); IS WOrkING
      if (i % 3 == 0) {
        var theVariable = JSON.stringify(allValues[i])
        let sql = `INSERT INTO FPnumberPoint (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
    console.log(allValuesDates);
    //
    //
    uniqueValueDates = allValuesDates.filter( function( item, index, inputArray ) {
           return inputArray.indexOf(item) == index;
    });

    console.log(uniqueValueDates);


    // console.log(uniqueValueDates);
    var array = []
    function getTheAverageFP(uniqueValueDates, theArray) {
      req.session.hello = 2+3
      for (var i = 0; i < uniqueValueDates.length ; i++) {
        req.session.dates = uniqueValueDates;
        let sql2 = 'SELECT AVG(level) AS averageLevel FROM FPnumberPoint WHERE date = "' + uniqueValueDates[i] +'";'
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
                 let sql3 = `INSERT INTO FP (date) VALUES (`+dateString+`);`
                 db.query (sql3, (err, result)=> {
                 })
                 if (z+1 == dates.length) {
                   for (var q = 0; q < array.length; q++) {
                     // console.log("q = "+ q);
                     var theLevel = array[q];
                     var idMatch = q+1;
                     // console.log(idMatch);
                     let sql4 = `UPDATE FP SET nitrateLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
    getTheAverageFP(uniqueValueDates, array)
    res.render('nitrateAnalyzedFP')
    })
  app.get('/salineFP', function(req, res) {


        var FPSaline = XLSX.readFile('IRL-FP-Saline.xlsx');
        const sheet_name_list = FPSaline.sheetNames;


        var hello = FPSaline.Sheets.Sheet1
        var allValues = []
        for(var sequence in hello) {
          allValues.push(FPSaline.Sheets.Sheet1[sequence].w)

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
            let sql = `INSERT INTO FPnumberPointSaline (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
        function getTheAverageFP(uniqueValueDates, theArray) {
          req.session.hello = 2+3
          for (var i = 0; i < uniqueValueDates.length ; i++) {
            req.session.dates = uniqueValueDates;
            let sql2 = 'SELECT AVG(level) AS averageLevel FROM FPnumberPointSaline WHERE date = "' + uniqueValueDates[i] +'";'
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
                         let sql4 = `UPDATE FP SET salineLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
        getTheAverageFP(uniqueValueDates, array)
        res.render('salineAnalyzedFP')
        })
  app.get('/FPSearch', function(req, res) {


                var FPTemp = XLSX.readFile('IRL-FP-Temp.xlsx');
                const sheet_name_list = FPTemp.sheetNames;


                var hello = FPTemp.Sheets.Sheet1
                var allValues = []
                for(var sequence in hello) {
                  allValues.push(FPTemp.Sheets.Sheet1[sequence].w)

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
                    let sql = `INSERT INTO FPnumberPointTemp (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
                function getTheAverageFP(uniqueValueDates, theArray) {
                  req.session.hello = 2+3
                  for (var i = 0; i < uniqueValueDates.length ; i++) {
                    req.session.dates = uniqueValueDates;
                    let sql2 = 'SELECT AVG(level) AS averageLevel FROM FPnumberPointTemp WHERE date = "' + uniqueValueDates[i] +'";'
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
                                 let sql4 = `UPDATE FP SET tempLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
                getTheAverageFP(uniqueValueDates, array)
                res.render('tempAnalyzedFP')
                })
  app.get('/searchForSiteFP', function(req, res){
      res.render('searchForSiteFP')
    })
  app.post('/dateFP', function(req, res){
      let date = req.body.date;
      console.log(date);
      let sql10 = `SELECT * FROM FP WHERE date ="` + date + `";`
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
        let sql2 = `SELECT * FROM FP WHERE id > ` + week + ' && id <= '+day+';'
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
                let sql3 = `SELECT * FROM FP WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                      let sql4 = `SELECT * FROM FP WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                            var aChanceOfAnAlgaeBloom
                            var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)
                        var alert
                        var StringChanceOfAnAlgaeBloom
                        if (chanceOfAnAlgaeBloom) {
                          StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                          alert = "alert-danger"
                        } else if (!chanceOfAnAlgaeBloom) {
                          StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                          alert = "alert-success"
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
                        req.session.londonTempDataForSearchFP = {
                        // city: 'Florida',
                        // unit: 'celsius',
                          dataPoints: dataForNitrateForSearch
                        }
                      //
                        req.session.salineForSearchLevelDataForGraphFP = {
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

                        req.session.theTempDataForGraphForSearchFP = {
                        // city: 'Florida',
                        // unit: 'celsius',
                          dataPoints: dataFortheTempForSearch
                        }

                        console.log(req.session.salineForSearchLevelDataForGraphFP);



                       // for Nitrate
                       req.session.resetCodeForNitrateForSearchFP = ''
                      app.get('/getTemperatureForSearchFP'+req.session.resetCodeForNitrateForSearchFP, function(req,res){
                        res.send(req.session.londonTempDataForSearchFP);
                      });
                        app.get('/addTemperatureForSearchFP', function(req,res){
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
                        req.session.resetCodeForSalineForSearchFP = ''
                        app.get('/getSalineForSearchFP'+req.session.resetCodeForSalineForSearchFP, function(req,res){
                          res.send(req.session.salineForSearchLevelDataForGraphFP);
                        });
                        app.get('/addSalineForSearchFP', function(req,res){
                          var salineForSearch = parseInt(req.query.salineForSearch);
                          var timeForSearch = parseInt(req.query.timeForSearch);
                          if(salineForSearch && timeForSearch && !isNaN(salineForSearch) && !isNaN(timeForSearch)){
                            var newDataPoint = {
                              saline: salineForSearch,
                              time: timeForSearch
                            };
                            req.session.salineForSearchLevelDataForGraphFP.dataPoints.push(newDataPoint);
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
                        req.session.resetCodeFortheTempForSearchFP = ''
                        app.get('/gettheTempForSearchFP'+req.session.resetCodeFortheTempForSearchFP, function(req,res){
                          res.send(req.session.theTempDataForGraphForSearchFP);
                        });
                        app.get('/addtheTempForSearchFP', function(req,res){
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
                      res.render('index4FP', {alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})

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
  app.get('/resetSearchFP', function(req, res,) {
      req.session.resetCodeForSalineForSearchFP = "reset"
      req.session.resetCodeForNitrateForSearchFP = "reset"
      req.session.resetCodeFortheTempForSearchFP = "reset"

      app.get('/getSalineForSearchFP'+req.session.resetCodeForSalineForSearchFP, function(req,res){
        res.send(req.session.salineForSearchLevelDataForGraphFP);
      });
     app.get('/getTemperatureForSearchFP'+req.session.resetCodeForNitrateForSearchFP, function(req,res){
       res.send(req.session.londonTempDataForSearchFP);
     });
     app.get('/gettheTempForSearchFP'+req.session.resetCodeFortheTempForSearchFP, function(req,res){
       res.send(req.session.londonTempDataForSearchFP);
     });
      res.redirect('/')
    })
  app.get('/fpdata', function (req, res) {
      let sql = 'SELECT COUNT(*) FROM FP'
      db.query (sql, (err, result)=>{
        var day = result[0]["COUNT(*)"]
        var week = day - 7
        let sql2 = `SELECT * FROM FP WHERE id > ` + week + ';'
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
                    score = .125
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                    score = .25
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                    score = .375
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 2) {
                    score = .5
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)
                  }
                } else if (weekData[i].nitrateLevel <= 9 && weekData[i].nitrateLevel >= 6) {
                  if (weekData[i].salineLevel >= 23) {
                    score = .25
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                    score = .375
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                    score = 1
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 2) {
                    score = 1.5
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)
                  }
                } else if (weekData[i].nitrateLevel < 12 && weekData[i].nitrateLevel > 9) {
                  if (weekData[i].salineLevel >= 23) {
                    score = .5
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
                    score = 1.5
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)
                  }
                } else if (weekData[i].nitrateLevel >= 12) {
                  if (weekData[i].salineLevel >= 23) {
                    score = .75
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                    score = 1
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                    score = 1.25
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 2) {
                    score = 2
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
              let sql3 = `SELECT * FROM FP WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                    let sql4 = `SELECT * FROM FP WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                          var aChanceOfAnAlgaeBloom

                          var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)



                      var StringChanceOfAnAlgaeBloom
                      var alert
                      if (chanceOfAnAlgaeBloom) {
                        StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                        alert = "alert-danger"
                      } else if (!chanceOfAnAlgaeBloom) {
                        StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                        alert = "alert-success"
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
                      app.get('/getTemperatureFP', function(req,res){
                      res.send(londonTempData);
                    });
                      app.get('/addTemperatureFP', function(req,res){
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
                      app.get('/getSalineFP', function(req,res){
                        res.send(salineLevelDataForGraph);
                      });
                      app.get('/addSalineFP', function(req,res){
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
                      app.get('/gettheTempFP', function(req,res){
                        res.send(theTempDataForGraph);
                      });
                      app.get('/addtheTempFP', function(req,res){
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

                      let sql10 = `SELECT * FROM LP WHERE id ="` + day + `";`
                      console.log(sql10);
                      db.query(sql10, (err, result)=>{
                        var conditions = result[0]
                        res.render('fpdata', {conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})

                      });                      // console.log(twoWeeksAgoData);
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

  app.get('/getInfo', function (req, res) {
    res.render('moreInfo')
  })



  /////////////================================= SFE-SF Daya
  app.get('/sf', function(req, res) {


    var SFNitrate = XLSX.readFile('SLE-SF-Nitrate.xlsx');
    const sheet_name_list = SFNitrate.sheetNames;
    var hello = SFNitrate.Sheets.Sheet1
    var allValues = []
    for(var sequence in hello) {
      allValues.push(SFNitrate.Sheets.Sheet1[sequence].w)
    }
    console.log(allValues.length);
    var numberOfEntries = 0
    var totalForDay = 0.0
    var allValuesJSON = JSON.stringify(allValues);
    allValues.shift()


    console.log("Hello");
    req.session.okay = "hello"
    // ***PUT ALL VALUES INTO DB************************************************************************************************
    for (var i = 0; i < allValues.length; i++) {
      // console.log("All Values == "+ allValues.length); IS WOrkING
      if (i % 3 == 0) {
        var theVariable = JSON.stringify(allValues[i])
        let sql = `INSERT INTO SFnumberPoint (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
    console.log(allValuesDates);
    //
    //
    uniqueValueDates = allValuesDates.filter( function( item, index, inputArray ) {
           return inputArray.indexOf(item) == index;
    });

    console.log(uniqueValueDates);


    // console.log(uniqueValueDates);
    var array = []
    function getTheAverageSF(uniqueValueDates, theArray) {
      req.session.hello = 2+3
      for (var i = 0; i < uniqueValueDates.length ; i++) {
        req.session.dates = uniqueValueDates;
        let sql2 = 'SELECT AVG(level) AS averageLevel FROM SFnumberPoint WHERE date = "' + uniqueValueDates[i] +'";'
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
                 let sql3 = `INSERT INTO SF (date) VALUES (`+dateString+`);`
                 db.query (sql3, (err, result)=> {
                 })
                 if (z+1 == dates.length) {
                   for (var q = 0; q < array.length; q++) {
                     // console.log("q = "+ q);
                     var theLevel = array[q];
                     var idMatch = q+1;
                     // console.log(idMatch);
                     let sql4 = `UPDATE SF SET nitrateLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
    getTheAverageSF(uniqueValueDates, array)
    res.render('nitrateAnalyzedSF')
    })
  app.get('/createSF', function(req,res) {
         let createSF = `CREATE TABLE SF (id int AUTO_INCREMENT, date VARCHAR(255), nitrateLevel FLOAT, salineLevel FLOAT, tempLevel FLOAT, PRIMARY KEY (id));`
         db.query(createSF, (err, result)=>{
           console.log(result);
         })
         //
         let sql5 = `CREATE TABLE SFnumberPoint (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
         db.query(sql5, (err,result)=>{
           console.log(result);
         })
         //
         let sql6 = `CREATE TABLE SFnumberPointSaline (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
         db.query(sql6, (err,result)=>{
           console.log(result);
         })
         //
         let sql8 = `CREATE TABLE SFnumberPointTemp (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
         db.query(sql8, (err,result)=>{
           console.log(result);
         })
         res.render('home')

       })
  app.get('/deleteSF', function(req,res){
         let SFsql = `DROP TABLE SF;`
         db.query(SFsql, (err,result)=> {
         })
         let SFnumberPointSQL = `DROP TABLE SFnumberPoint;`
         db.query(SFnumberPointSQL, (err,result)=>{
         })
         let SFsalineSQL = `DROP TABLE SFnumberPointSaline;`
         db.query(SFsalineSQL, (err,result)=>{
         })
         let SFtempSQL = `DROP Table SFnumberPointTemp;`
         db.query(SFtempSQL, (err, result)=>{
         })
         res.render('home')
       });
  app.get('/salineSF', function(req, res) {
   var SFSaline = XLSX.readFile('SLE-SF-Saline.xlsx');
   const sheet_name_list = SFSaline.sheetNames;


   var hello = SFSaline.Sheets.Sheet1
   var allValues = []
   for(var sequence in hello) {
     allValues.push(SFSaline.Sheets.Sheet1[sequence].w)

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
       let sql = `INSERT INTO SFnumberPointSaline (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
   function getTheAverageSF(uniqueValueDates, theArray) {
     req.session.hello = 2+3
     for (var i = 0; i < uniqueValueDates.length ; i++) {
       req.session.dates = uniqueValueDates;
       let sql2 = 'SELECT AVG(level) AS averageLevel FROM SFnumberPointSaline WHERE date = "' + uniqueValueDates[i] +'";'
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
                    let sql4 = `UPDATE SF SET salineLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
   getTheAverageSF(uniqueValueDates, array)
   res.render('salineAnalyzedSF')
   })
  app.get('/SFSearch', function(req, res) {
                 var SFTemp = XLSX.readFile('SLE-SF-Temp.xlsx');
                 const sheet_name_list = SFTemp.sheetNames;


                 var hello = SFTemp.Sheets.Sheet1
                 var allValues = []
                 for(var sequence in hello) {
                   allValues.push(SFTemp.Sheets.Sheet1[sequence].w)

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
                     let sql = `INSERT INTO SFnumberPointTemp (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
                 function getTheAverageSF(uniqueValueDates, theArray) {
                   req.session.hello = 2+3
                   for (var i = 0; i < uniqueValueDates.length ; i++) {
                     req.session.dates = uniqueValueDates;
                     let sql2 = 'SELECT AVG(level) AS averageLevel FROM SFnumberPointTemp WHERE date = "' + uniqueValueDates[i] +'";'
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
                                  let sql4 = `UPDATE SF SET tempLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
                 getTheAverageSF(uniqueValueDates, array)
                 res.render('tempAnalyzedSF')
                 })
  app.get('/createFP', function(req,res) {
     let createFP = `CREATE TABLE FP (id int AUTO_INCREMENT, date VARCHAR(255), nitrateLevel FLOAT, salineLevel FLOAT, tempLevel FLOAT, PRIMARY KEY (id));`
     db.query(createFP, (err, result)=>{
       console.log(result);
     })
     //
     let sql5 = `CREATE TABLE FPnumberPoint (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
     db.query(sql5, (err,result)=>{
       console.log(result);
     })
     //
     let sql6 = `CREATE TABLE FPnumberPointSaline (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
     db.query(sql6, (err,result)=>{
       console.log(result);
     })
     //
     let sql8 = `CREATE TABLE FPnumberPointTemp (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
     db.query(sql8, (err,result)=>{
       console.log(result);
     })
     res.render('home')

   })
  app.get('/deleteFP', function(req,res){
     let FPsql = `DROP TABLE FP;`
     db.query(FPsql, (err,result)=> {
     })
     let FPnumberPointSQL = `DROP TABLE FPnumberPoint;`
     db.query(FPnumberPointSQL, (err,result)=>{
     })
     let FPsalineSQL = `DROP TABLE FPnumberPointSaline;`
     db.query(FPsalineSQL, (err,result)=>{
     })
     let FPtempSQL = `DROP Table FPnumberPointTemp;`
     db.query(FPtempSQL, (err, result)=>{
     })
     res.render('home')
   });
  app.get('/searchForSiteSF', function(req, res){
       res.render('searchForSiteSF')
     })
  app.post('/dateSF', function(req, res){
         let date = req.body.date;
         console.log(date);
         let sql10 = `SELECT * FROM SF WHERE date ="` + date + `";`
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
           let sql2 = `SELECT * FROM SF WHERE id > ` + week + ' && id <= '+day+';'
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
                   let sql3 = `SELECT * FROM SF WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                         //CHECK HERE FOR REFINEMENTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                       if (weekData[i].temp <= 24.4) {
                           points = 0.5
                           OneWeekAgoTempScoreArray.push(points)
                           OneWeekAgoTempScore += points
                         } else if (weekData[i].temp > 24.4 && weekData[i].temp < 28.4) {
                           points = .92
                           OneWeekAgoTempScoreArray.push(points)
                           OneWeekAgoTempScore += points
                         } else if (weekData[i].temp >= 28.4 && weekData[i].temp <= 31.4) {
                           points = 1.05
                           OneWeekAgoTempScoreArray.push(points)
                           OneWeekAgoTempScore += points
                         }else if (weekData[i].temp >=31.4 && weekData[i].temp <= 35) {
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
                         let sql4 = `SELECT * FROM SF WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                               var aChanceOfAnAlgaeBloom

                             var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)


                           var alert
                           var StringChanceOfAnAlgaeBloom
                           if (chanceOfAnAlgaeBloom) {
                             StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                             alert = "alert-danger"
                           } else if (!chanceOfAnAlgaeBloom) {
                             StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                             alert = "alert-success"
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
                           req.session.londonTempDataForSearchSF = {
                           // city: 'Florida',
                           // unit: 'celsius',
                             dataPoints: dataForNitrateForSearch
                           }
                         //
                           req.session.salineForSearchLevelDataForGraphSF = {
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

                           req.session.theTempDataForGraphForSearchSF = {
                           // city: 'Florida',
                           // unit: 'celsius',
                             dataPoints: dataFortheTempForSearch
                           }

                           console.log(req.session.salineForSearchLevelDataForGraphSF);



                          // for Nitrate
                          req.session.resetCodeForNitrateForSearchSF = ''
                         app.get('/getTemperatureForSearchSF'+req.session.resetCodeForNitrateForSearchSF, function(req,res){
                           res.send(req.session.londonTempDataForSearchSF);
                         });
                           app.get('/addTemperatureForSearchSF', function(req,res){
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
                           req.session.resetCodeForSalineForSearchSF = ''
                           app.get('/getSalineForSearchSF'+req.session.resetCodeForSalineForSearchSF, function(req,res){
                             res.send(req.session.salineForSearchLevelDataForGraphSF);
                           });
                           app.get('/addSalineForSearchSF', function(req,res){
                             var salineForSearch = parseInt(req.query.salineForSearch);
                             var timeForSearch = parseInt(req.query.timeForSearch);
                             if(salineForSearch && timeForSearch && !isNaN(salineForSearch) && !isNaN(timeForSearch)){
                               var newDataPoint = {
                                 saline: salineForSearch,
                                 time: timeForSearch
                               };
                               req.session.salineForSearchLevelDataForGraphSF.dataPoints.push(newDataPoint);
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
                           req.session.resetCodeFortheTempForSearchSF = ''
                           app.get('/gettheTempForSearchSF'+req.session.resetCodeFortheTempForSearchSF, function(req,res){
                             res.send(req.session.theTempDataForGraphForSearchSF);
                           });
                           app.get('/addtheTempForSearchSF', function(req,res){
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
                         res.render('index4SF', {alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})

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
  app.get('/resetSearchSF', function(req, res,) {
           req.session.resetCodeForSalineForSearchSF = "reset"
           req.session.resetCodeForNitrateForSearchSF = "reset"
           req.session.resetCodeFortheTempForSearchSF = "reset"

           app.get('/getSalineForSearchSF'+req.session.resetCodeForSalineForSearchSF, function(req,res){
             res.send(req.session.salineForSearchLevelDataForGraphSF);
           });
          app.get('/getTemperatureForSearchSF'+req.session.resetCodeForNitrateForSearchSF, function(req,res){
            res.send(req.session.londonTempDataForSearchSF);
          });
          app.get('/gettheTempForSearchSF'+req.session.resetCodeFortheTempForSearchFP, function(req,res){
            res.send(req.session.londonTempDataForSearchSF);
          });
           res.redirect('/')
  })
  app.get('/sfdata', function (req, res) {
      let sql = 'SELECT COUNT(*) FROM SF'
      db.query (sql, (err, result)=>{
        var day = result[0]["COUNT(*)"]
        var week = day - 7
        let sql2 = `SELECT * FROM SF WHERE id > ` + week + ';'
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
                    score = .125
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                    score = .25
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                    score = .375
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 2) {
                    score = .5
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)
                  }
                } else if (weekData[i].nitrateLevel <= 9 && weekData[i].nitrateLevel >= 6) {
                  if (weekData[i].salineLevel >= 23) {
                    score = .25
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                    score = .375
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                    score = 1
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 2) {
                    score = 1.5
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)
                  }
                } else if (weekData[i].nitrateLevel < 12 && weekData[i].nitrateLevel > 9) {
                  if (weekData[i].salineLevel >= 23) {
                    score = .5
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
                    score = 1.5
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)
                  }
                } else if (weekData[i].nitrateLevel >= 12) {
                  if (weekData[i].salineLevel >= 23) {
                    score = .75
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                    score = 1
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                    score = 1.25
                    nitrateSalineScore += score
                    nitrateSalineScoreArray.push(score)

                  } else if (weekData[i].salineLevel < 2) {
                    score = 2
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
              let sql3 = `SELECT * FROM SF WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                    let sql4 = `SELECT * FROM SF WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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


                          var aChanceOfAnAlgaeBloom

                        var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)


                      var StringChanceOfAnAlgaeBloom
                      var alert
                      if (chanceOfAnAlgaeBloom) {
                        StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                        alert = "alert-danger"
                      } else if (!chanceOfAnAlgaeBloom) {
                        StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                        alert = "alert-success"
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
                      app.get('/getTemperatureSF', function(req,res){ //styppsxd
                      res.send(londonTempData);
                    });
                      app.get('/addTemperatureSF', function(req,res){
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
                      app.get('/getSalineSF', function(req,res){
                        res.send(salineLevelDataForGraph);
                      });
                      app.get('/addSalineSF', function(req,res){
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
                      app.get('/gettheTempSF', function(req,res){
                        res.send(theTempDataForGraph);
                      });
                      app.get('/addtheTempSF', function(req,res){
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

                      let sql10 = `SELECT * FROM SF WHERE id ="` + day + `";`
                      console.log(sql10);
                      db.query(sql10, (err, result)=>{
                        var conditions = result[0]
                        res.render('sfdata', {conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})

                      });                      // console.log(twoWeeksAgoData);
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


// IRL-SB =====================================================
  app.get('/createSB', function(req,res) {
     let createSB = `CREATE TABLE SB (id int AUTO_INCREMENT, date VARCHAR(255), nitrateLevel FLOAT, salineLevel FLOAT, tempLevel FLOAT, PRIMARY KEY (id));`
     db.query(createSB, (err, result)=>{
       console.log(result);
     })
     //
     let sql5 = `CREATE TABLE SBnumberPoint (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
     db.query(sql5, (err,result)=>{
       console.log(result);
     })
     //
     let sql6 = `CREATE TABLE SBnumberPointSaline (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
     db.query(sql6, (err,result)=>{
       console.log(result);
     })
     //
     let sql8 = `CREATE TABLE SBnumberPointTemp (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
     db.query(sql8, (err,result)=>{
       console.log(result);
     })
     res.render('home')

   })
  app.get('/deleteSB', function(req,res){
     let SBsql = `DROP TABLE SB;`
     db.query(SBsql, (err,result)=> {
     })
     let SBnumberPointSQL = `DROP TABLE SBnumberPoint;`
     db.query(SBnumberPointSQL, (err,result)=>{
     })
     let SBsalineSQL = `DROP TABLE SBnumberPointSaline;`
     db.query(SBsalineSQL, (err,result)=>{
     })
     let SBtempSQL = `DROP Table SBnumberPointTemp;`
     db.query(SBtempSQL, (err, result)=>{
     })
     res.render('home')
   });
  app.get('/sb', function(req, res) {


    var SBNitrate = XLSX.readFile('IRL-SB-Nitrate.xlsx');
    const sheet_name_list = SBNitrate.sheetNames;
    var hello = SBNitrate.Sheets.Sheet1
    var allValues = []
    for(var sequence in hello) {
      allValues.push(SBNitrate.Sheets.Sheet1[sequence].w)
    }
    console.log(allValues.length);
    var numberOfEntries = 0
    var totalForDay = 0.0
    var allValuesJSON = JSON.stringify(allValues);
    allValues.shift()


    console.log("Hello");
    req.session.okay = "hello"
    // ***PUT ALL VALUES INTO DB************************************************************************************************
    for (var i = 0; i < allValues.length; i++) {
      // console.log("All Values == "+ allValues.length); IS WOrkING
      if (i % 3 == 0) {
        var theVariable = JSON.stringify(allValues[i])
        let sql = `INSERT INTO SBnumberPoint (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
    console.log(allValuesDates);
    //
    //
    uniqueValueDates = allValuesDates.filter( function( item, index, inputArray ) {
           return inputArray.indexOf(item) == index;
    });

    console.log(uniqueValueDates);


    // console.log(uniqueValueDates);
    var array = []
    function getTheAverageSB(uniqueValueDates, theArray) {
      req.session.hello = 2+3
      for (var i = 0; i < uniqueValueDates.length ; i++) {
        req.session.dates = uniqueValueDates;
        let sql2 = 'SELECT AVG(level) AS averageLevel FROM SBnumberPoint WHERE date = "' + uniqueValueDates[i] +'";'
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
                 let sql3 = `INSERT INTO SB (date) VALUES (`+dateString+`);`
                 db.query (sql3, (err, result)=> {
                 })
                 if (z+1 == dates.length) {
                   for (var q = 0; q < array.length; q++) {
                     // console.log("q = "+ q);
                     var theLevel = array[q];
                     var idMatch = q+1;
                     // console.log(idMatch);
                     let sql4 = `UPDATE SB SET nitrateLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
    getTheAverageSB(uniqueValueDates, array)
    res.render('nitrateAnalyzedSB')
    })
  app.get('/salineSB', function(req, res) {
     var SBSaline = XLSX.readFile('IRL-SB-Saline.xlsx');
     const sheet_name_list = SBSaline.sheetNames;


     var hello = SBSaline.Sheets.Sheet1
     var allValues = []
     for(var sequence in hello) {
       allValues.push(SBSaline.Sheets.Sheet1[sequence].w)

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
         let sql = `INSERT INTO SBnumberPointSaline (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
     function getTheAverageSB(uniqueValueDates, theArray) {
       req.session.hello = 2+3
       for (var i = 0; i < uniqueValueDates.length ; i++) {
         req.session.dates = uniqueValueDates;
         let sql2 = 'SELECT AVG(level) AS averageLevel FROM SBnumberPointSaline WHERE date = "' + uniqueValueDates[i] +'";'
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
                      let sql4 = `UPDATE SB SET salineLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
     getTheAverageSB(uniqueValueDates, array)
     res.render('salineAnalyzedSB')
     })
  app.get('/SBSearch', function(req, res) {
                    var SBTemp = XLSX.readFile('IRL-SB-Temp.xlsx');
                    const sheet_name_list = SBTemp.sheetNames;


                    var hello = SBTemp.Sheets.Sheet1
                    var allValues = []
                    for(var sequence in hello) {
                      allValues.push(SBTemp.Sheets.Sheet1[sequence].w)

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
                        let sql = `INSERT INTO SBnumberPointTemp (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
                    function getTheAverageSB(uniqueValueDates, theArray) {
                      req.session.hello = 2+3
                      for (var i = 0; i < uniqueValueDates.length ; i++) {
                        req.session.dates = uniqueValueDates;
                        let sql2 = 'SELECT AVG(level) AS averageLevel FROM SBnumberPointTemp WHERE date = "' + uniqueValueDates[i] +'";'
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
                                     let sql4 = `UPDATE SB SET tempLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
                    getTheAverageSB(uniqueValueDates, array)
                    res.render('tempAnalyzedSB')
                    })
  app.get('/searchForSiteSB', function(req, res){
     res.render('searchForSiteSB')
  })
  app.post('/dateSB', function(req, res){
         let date = req.body.date;
         console.log(date);
         let sql10 = `SELECT * FROM SB WHERE date ="` + date + `";`
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
           let sql2 = `SELECT * FROM SB WHERE id > ` + week + ' && id <= '+day+';'
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
                   let sql3 = `SELECT * FROM SB WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                         //CHECK HERE FOR REFINEMENTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                       if (weekData[i].temp <= 24.4) {
                           points = 0.5
                           OneWeekAgoTempScoreArray.push(points)
                           OneWeekAgoTempScore += points
                         } else if (weekData[i].temp > 24.4 && weekData[i].temp < 28.4) {
                           points = .92
                           OneWeekAgoTempScoreArray.push(points)
                           OneWeekAgoTempScore += points
                         } else if (weekData[i].temp >= 28.4 && weekData[i].temp <= 31.4) {
                           points = 1.05
                           OneWeekAgoTempScoreArray.push(points)
                           OneWeekAgoTempScore += points
                         }else if (weekData[i].temp >=31.4 && weekData[i].temp <= 35) {
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
                         let sql4 = `SELECT * FROM SB WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                                 pts = .95
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
                               var aChanceOfAnAlgaeBloom

                             var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)


                           var alert
                           var StringChanceOfAnAlgaeBloom
                           if (chanceOfAnAlgaeBloom) {
                             StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                             alert = "alert-danger"
                           } else if (!chanceOfAnAlgaeBloom) {
                             StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                             alert = "alert-success"
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
                           req.session.londonTempDataForSearchSB = {
                           // city: 'Florida',
                           // unit: 'celsius',
                             dataPoints: dataForNitrateForSearch
                           }
                         //
                           req.session.salineForSearchLevelDataForGraphSB = {
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

                           req.session.theTempDataForGraphForSearchSB = {
                           // city: 'Florida',
                           // unit: 'celsius',
                             dataPoints: dataFortheTempForSearch
                           }

                           console.log(req.session.salineForSearchLevelDataForGraphSB);



                          // for Nitrate
                          req.session.resetCodeForNitrateForSearchSB = ''
                         app.get('/getTemperatureForSearchSB'+req.session.resetCodeForNitrateForSearchSB, function(req,res){
                           res.send(req.session.londonTempDataForSearchSB);
                         });
                           app.get('/addTemperatureForSearchSB', function(req,res){
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
                           req.session.resetCodeForSalineForSearchSB = ''
                           app.get('/getSalineForSearchSB'+req.session.resetCodeForSalineForSearchSB, function(req,res){
                             res.send(req.session.salineForSearchLevelDataForGraphSB);
                           });
                           app.get('/addSalineForSearchSB', function(req,res){
                             var salineForSearch = parseInt(req.query.salineForSearch);
                             var timeForSearch = parseInt(req.query.timeForSearch);
                             if(salineForSearch && timeForSearch && !isNaN(salineForSearch) && !isNaN(timeForSearch)){
                               var newDataPoint = {
                                 saline: salineForSearch,
                                 time: timeForSearch
                               };
                               req.session.salineForSearchLevelDataForGraphSB.dataPoints.push(newDataPoint);
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
                           req.session.resetCodeFortheTempForSearchSB = ''
                           app.get('/gettheTempForSearchSB'+req.session.resetCodeFortheTempForSearchSB, function(req,res){
                             res.send(req.session.theTempDataForGraphForSearchSB);
                           });
                           app.get('/addtheTempForSearchSB', function(req,res){
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
                         res.render('index4SB', {alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})

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
  app.get('/resetSearchSB', function(req, res,) {
                req.session.resetCodeForSalineForSearchSB = "reset"
                req.session.resetCodeForNitrateForSearchSB = "reset"
                req.session.resetCodeFortheTempForSearchSB = "reset"

                app.get('/getSalineForSearchSB'+req.session.resetCodeForSalineForSearchSB, function(req,res){
                  res.send(req.session.salineForSearchLevelDataForGraphSB);
                });
               app.get('/getTemperatureForSearchSB'+req.session.resetCodeForNitrateForSearchSB, function(req,res){
                 res.send(req.session.londonTempDataForSearchSB);
               });
               app.get('/gettheTempForSearchSB'+req.session.resetCodeFortheTempForSearchFP, function(req,res){
                 res.send(req.session.londonTempDataForSearchSB);
               });
                res.redirect('/')
       })
  app.get('/SBdata', function (req, res) {
           let sql = 'SELECT COUNT(*) FROM SB'
           db.query (sql, (err, result)=>{
             var day = result[0]["COUNT(*)"]
             var week = day - 7
             let sql2 = `SELECT * FROM SB WHERE id > ` + week + ';'
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
                         score = .125
                         nitrateSalineScore += score
                         nitrateSalineScoreArray.push(score)

                       } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                         score = .25
                         nitrateSalineScore += score
                         nitrateSalineScoreArray.push(score)

                       } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                         score = .375
                         nitrateSalineScore += score
                         nitrateSalineScoreArray.push(score)

                       } else if (weekData[i].salineLevel < 2) {
                         score = .5
                         nitrateSalineScore += score
                         nitrateSalineScoreArray.push(score)
                       }
                     } else if (weekData[i].nitrateLevel <= 9 && weekData[i].nitrateLevel >= 6) {
                       if (weekData[i].salineLevel >= 23) {
                         score = .25
                         nitrateSalineScore += score
                         nitrateSalineScoreArray.push(score)

                       } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                         score = .375
                         nitrateSalineScore += score
                         nitrateSalineScoreArray.push(score)

                       } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                         score = 1
                         nitrateSalineScore += score
                         nitrateSalineScoreArray.push(score)

                       } else if (weekData[i].salineLevel < 2) {
                         score = 1.5
                         nitrateSalineScore += score
                         nitrateSalineScoreArray.push(score)
                       }
                     } else if (weekData[i].nitrateLevel < 12 && weekData[i].nitrateLevel > 9) {
                       if (weekData[i].salineLevel >= 23) {
                         score = .5
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
                         score = 1.5
                         nitrateSalineScore += score
                         nitrateSalineScoreArray.push(score)
                       }
                     } else if (weekData[i].nitrateLevel >= 12) {
                       if (weekData[i].salineLevel >= 23) {
                         score = .75
                         nitrateSalineScore += score
                         nitrateSalineScoreArray.push(score)

                       } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                         score = 1
                         nitrateSalineScore += score
                         nitrateSalineScoreArray.push(score)

                       } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                         score = 1.25
                         nitrateSalineScore += score
                         nitrateSalineScoreArray.push(score)

                       } else if (weekData[i].salineLevel < 2) {
                         score = 2
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
                   let sql3 = `SELECT * FROM SB WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                         let sql4 = `SELECT * FROM SB WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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


                               var aChanceOfAnAlgaeBloom

                             var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)


                           var StringChanceOfAnAlgaeBloom
                           var alert
                           if (chanceOfAnAlgaeBloom) {
                             StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                             alert = "alert-danger"
                           } else if (!chanceOfAnAlgaeBloom) {
                             StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                             alert = "alert-success"
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
                           app.get('/getTemperatureSB', function(req,res){ //styppsxd
                           res.send(londonTempData);
                         });
                           app.get('/addTemperatureSB', function(req,res){
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
                           app.get('/getSalineSB', function(req,res){
                             res.send(salineLevelDataForGraph);
                           });
                           app.get('/addSalineSB', function(req,res){
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
                           app.get('/gettheTempSB', function(req,res){
                             res.send(theTempDataForGraph);
                           });
                           app.get('/addtheTempSB', function(req,res){
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

                           let sql10 = `SELECT * FROM SB WHERE id ="` + day + `";`
                           console.log(sql10);
                           db.query(sql10, (err, result)=>{
                             var conditions = result[0]
                             res.render('SBdata', {conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})

                           });                      // console.log(twoWeeksAgoData);
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

// NF
  app.get('/createNF', function(req,res) {
   let createNF = `CREATE TABLE NF (id int AUTO_INCREMENT, date VARCHAR(255), nitrateLevel FLOAT, salineLevel FLOAT, tempLevel FLOAT, PRIMARY KEY (id));`
   db.query(createNF, (err, result)=>{
     console.log(result);
   })
   //
   let sql5 = `CREATE TABLE NFnumberPoint (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
   db.query(sql5, (err,result)=>{
     console.log(result);
   })
   //
   let sql6 = `CREATE TABLE NFnumberPointSaline (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
   db.query(sql6, (err,result)=>{
     console.log(result);
   })
   //
   let sql8 = `CREATE TABLE NFnumberPointTemp (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
   db.query(sql8, (err,result)=>{
     console.log(result);
   })
   res.render('home')
  })
  app.get('/deleteNF', function(req,res){
   let NFsql = `DROP TABLE NF;`
   db.query(NFsql, (err,result)=> {
   })
   let NFnumberPointSQL = `DROP TABLE NFnumberPoint;`
   db.query(NFnumberPointSQL, (err,result)=>{
   })
   let NFsalineSQL = `DROP TABLE NFnumberPointSaline;`
   db.query(NFsalineSQL, (err,result)=>{
   })
   let NFtempSQL = `DROP Table NFnumberPointTemp;`
   db.query(NFtempSQL, (err, result)=>{
   })
   res.render('home')
   });
  app.get('/NF', function(req, res) {


    var NFNitrate = XLSX.readFile('SLE-NF-Nitrate.xlsx');
    const sheet_name_list = NFNitrate.sheetNames;
    var hello = NFNitrate.Sheets.Sheet1
    var allValues = []
    for(var sequence in hello) {
      allValues.push(NFNitrate.Sheets.Sheet1[sequence].w)
    }
    console.log(allValues.length);
    var numberOfEntries = 0
    var totalForDay = 0.0
    var allValuesJSON = JSON.stringify(allValues);
    allValues.shift()


    console.log("Hello");
    req.session.okay = "hello"
    // ***PUT ALL VALUES INTO DB************************************************************************************************
    for (var i = 0; i < allValues.length; i++) {
      // console.log("All Values == "+ allValues.length); IS WOrkING
      if (i % 3 == 0) {
        var theVariable = JSON.stringify(allValues[i])
        let sql = `INSERT INTO NFnumberPoint (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
    console.log(allValuesDates);
    //
    //
    uniqueValueDates = allValuesDates.filter( function( item, index, inputArray ) {
           return inputArray.indexOf(item) == index;
    });

    console.log(uniqueValueDates);


    // console.log(uniqueValueDates);
    var array = []
    function getTheAverageNF(uniqueValueDates, theArray) {
      req.session.hello = 2+3
      for (var i = 0; i < uniqueValueDates.length ; i++) {
        req.session.dates = uniqueValueDates;
        let sql2 = 'SELECT AVG(level) AS averageLevel FROM NFnumberPoint WHERE date = "' + uniqueValueDates[i] +'";'
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
                 let sql3 = `INSERT INTO NF (date) VALUES (`+dateString+`);`
                 db.query (sql3, (err, result)=> {
                 })
                 if (z+1 == dates.length) {
                   for (var q = 0; q < array.length; q++) {
                     // console.log("q = "+ q);
                     var theLevel = array[q];
                     var idMatch = q+1;
                     // console.log(idMatch);
                     let sql4 = `UPDATE NF SET nitrateLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
    getTheAverageNF(uniqueValueDates, array)
    res.render('nitrateAnalyzedNF')
    })
  app.get('/salineNF', function(req, res) {
     var NFSaline = XLSX.readFile('SLE-NF-Saline.xlsx');
     const sheet_name_list = NFSaline.sheetNames;


     var hello = NFSaline.Sheets.Sheet1
     var allValues = []
     for(var sequence in hello) {
       allValues.push(NFSaline.Sheets.Sheet1[sequence].w)

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
         let sql = `INSERT INTO NFnumberPointSaline (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
     function getTheAverageNF(uniqueValueDates, theArray) {
       req.session.hello = 2+3
       for (var i = 0; i < uniqueValueDates.length ; i++) {
         req.session.dates = uniqueValueDates;
         let sql2 = 'SELECT AVG(level) AS averageLevel FROM NFnumberPointSaline WHERE date = "' + uniqueValueDates[i] +'";'
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
                      let sql4 = `UPDATE NF SET salineLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
     getTheAverageNF(uniqueValueDates, array)
     res.render('salineAnalyzedNF')
     })
  app.get('/NFSearch', function(req, res) {
                    var NFTemp = XLSX.readFile('SLE-NF-Temp.xlsx');
                    const sheet_name_list = NFTemp.sheetNames;


                    var hello = NFTemp.Sheets.Sheet1
                    var allValues = []
                    for(var sequence in hello) {
                      allValues.push(NFTemp.Sheets.Sheet1[sequence].w)

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
                        let sql = `INSERT INTO NFnumberPointTemp (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
                    function getTheAverageNF(uniqueValueDates, theArray) {
                      req.session.hello = 2+3
                      for (var i = 0; i < uniqueValueDates.length ; i++) {
                        req.session.dates = uniqueValueDates;
                        let sql2 = 'SELECT AVG(level) AS averageLevel FROM NFnumberPointTemp WHERE date = "' + uniqueValueDates[i] +'";'
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
                                     let sql4 = `UPDATE NF SET tempLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
                    getTheAverageNF(uniqueValueDates, array)
                    res.render('tempAnalyzedNF')
                    })
  app.get('/searchForSiteNF', function(req, res){
       res.render('searchForSiteNF')
     })
  app.post('/dateNF', function(req, res){
            let date = req.body.date;
            console.log(date);
            let sql10 = `SELECT * FROM NF WHERE date ="` + date + `";`
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
              let sql2 = `SELECT * FROM NF WHERE id > ` + week + ' && id <= '+day+';'
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
                      let sql3 = `SELECT * FROM NF WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                            //CHECK HERE FOR REFINEMENTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                          if (weekData[i].temp <= 24.4) {
                              points = 0.5
                              OneWeekAgoTempScoreArray.push(points)
                              OneWeekAgoTempScore += points
                            } else if (weekData[i].temp > 24.4 && weekData[i].temp < 28.4) {
                              points = .92
                              OneWeekAgoTempScoreArray.push(points)
                              OneWeekAgoTempScore += points
                            } else if (weekData[i].temp >= 28.4 && weekData[i].temp <= 31.4) {
                              points = 1.05
                              OneWeekAgoTempScoreArray.push(points)
                              OneWeekAgoTempScore += points
                            }else if (weekData[i].temp >=31.4 && weekData[i].temp <= 35) {
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
                            let sql4 = `SELECT * FROM NF WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                                  var aChanceOfAnAlgaeBloom

                                var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)


                              var alert
                              var StringChanceOfAnAlgaeBloom
                              if (chanceOfAnAlgaeBloom) {
                                StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                                alert = "alert-danger"
                              } else if (!chanceOfAnAlgaeBloom) {
                                StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                                alert = "alert-success"
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
                              req.session.londonTempDataForSearchNF = {
                              // city: 'Florida',
                              // unit: 'celsius',
                                dataPoints: dataForNitrateForSearch
                              }
                            //
                              req.session.salineForSearchLevelDataForGraphNF = {
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

                              req.session.theTempDataForGraphForSearchNF = {
                              // city: 'Florida',
                              // unit: 'celsius',
                                dataPoints: dataFortheTempForSearch
                              }

                              console.log(req.session.salineForSearchLevelDataForGraphNF);



                             // for Nitrate
                             req.session.resetCodeForNitrateForSearchNF = ''
                            app.get('/getTemperatureForSearchNF'+req.session.resetCodeForNitrateForSearchNF, function(req,res){
                              res.send(req.session.londonTempDataForSearchNF);
                            });
                              app.get('/addTemperatureForSearchNF', function(req,res){
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
                              req.session.resetCodeForSalineForSearchNF = ''
                              app.get('/getSalineForSearchNF'+req.session.resetCodeForSalineForSearchNF, function(req,res){
                                res.send(req.session.salineForSearchLevelDataForGraphNF);
                              });
                              app.get('/addSalineForSearchNF', function(req,res){
                                var salineForSearch = parseInt(req.query.salineForSearch);
                                var timeForSearch = parseInt(req.query.timeForSearch);
                                if(salineForSearch && timeForSearch && !isNaN(salineForSearch) && !isNaN(timeForSearch)){
                                  var newDataPoint = {
                                    saline: salineForSearch,
                                    time: timeForSearch
                                  };
                                  req.session.salineForSearchLevelDataForGraphNF.dataPoints.push(newDataPoint);
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
                              req.session.resetCodeFortheTempForSearchNF = ''
                              app.get('/gettheTempForSearchNF'+req.session.resetCodeFortheTempForSearchNF, function(req,res){
                                res.send(req.session.theTempDataForGraphForSearchNF);
                              });
                              app.get('/addtheTempForSearchNF', function(req,res){
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
                            res.render('index4NF', {alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})

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
  app.get('/resetSearchNF', function(req, res,) {
              req.session.resetCodeForSalineForSearchNF = "reset"
              req.session.resetCodeForNitrateForSearchNF = "reset"
              req.session.resetCodeFortheTempForSearchNF = "reset"

              app.get('/getSalineForSearchNF'+req.session.resetCodeForSalineForSearchNF, function(req,res){
                res.send(req.session.salineForSearchLevelDataForGraphNF);
              });
             app.get('/getTemperatureForSearchNF'+req.session.resetCodeForNitrateForSearchNF, function(req,res){
               res.send(req.session.londonTempDataForSearchNF);
             });
             app.get('/gettheTempForSearchNF'+req.session.resetCodeFortheTempForSearchFP, function(req,res){
               res.send(req.session.londonTempDataForSearchNF);
             });
              res.redirect('/')
     })
  app.get('/NFdata', function (req, res) {
         let sql = 'SELECT COUNT(*) FROM NF'
         db.query (sql, (err, result)=>{
           var day = result[0]["COUNT(*)"]
           var week = day - 7
           let sql2 = `SELECT * FROM NF WHERE id > ` + week + ';'
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
                       score = .125
                       nitrateSalineScore += score
                       nitrateSalineScoreArray.push(score)

                     } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                       score = .25
                       nitrateSalineScore += score
                       nitrateSalineScoreArray.push(score)

                     } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                       score = .375
                       nitrateSalineScore += score
                       nitrateSalineScoreArray.push(score)

                     } else if (weekData[i].salineLevel < 2) {
                       score = .5
                       nitrateSalineScore += score
                       nitrateSalineScoreArray.push(score)
                     }
                   } else if (weekData[i].nitrateLevel <= 9 && weekData[i].nitrateLevel >= 6) {
                     if (weekData[i].salineLevel >= 23) {
                       score = .25
                       nitrateSalineScore += score
                       nitrateSalineScoreArray.push(score)

                     } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                       score = .375
                       nitrateSalineScore += score
                       nitrateSalineScoreArray.push(score)

                     } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                       score = 1
                       nitrateSalineScore += score
                       nitrateSalineScoreArray.push(score)

                     } else if (weekData[i].salineLevel < 2) {
                       score = 1.5
                       nitrateSalineScore += score
                       nitrateSalineScoreArray.push(score)
                     }
                   } else if (weekData[i].nitrateLevel < 12 && weekData[i].nitrateLevel > 9) {
                     if (weekData[i].salineLevel >= 23) {
                       score = .5
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
                       score = 1.5
                       nitrateSalineScore += score
                       nitrateSalineScoreArray.push(score)
                     }
                   } else if (weekData[i].nitrateLevel >= 12) {
                     if (weekData[i].salineLevel >= 23) {
                       score = .75
                       nitrateSalineScore += score
                       nitrateSalineScoreArray.push(score)

                     } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                       score = 1
                       nitrateSalineScore += score
                       nitrateSalineScoreArray.push(score)

                     } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                       score = 1.25
                       nitrateSalineScore += score
                       nitrateSalineScoreArray.push(score)

                     } else if (weekData[i].salineLevel < 2) {
                       score = 2
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
                 let sql3 = `SELECT * FROM NF WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                       let sql4 = `SELECT * FROM NF WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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


                             var aChanceOfAnAlgaeBloom

                           var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)


                         var StringChanceOfAnAlgaeBloom
                         var alert
                         if (chanceOfAnAlgaeBloom) {
                           StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                           alert = "alert-danger"
                         } else if (!chanceOfAnAlgaeBloom) {
                           StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                           alert = "alert-success"
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
                         app.get('/getTemperatureNF', function(req,res){ //styppsxd
                         res.send(londonTempData);
                       });
                         app.get('/addTemperatureNF', function(req,res){
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
                         app.get('/getSalineNF', function(req,res){
                           res.send(salineLevelDataForGraph);
                         });
                         app.get('/addSalineNF', function(req,res){
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
                         app.get('/gettheTempNF', function(req,res){
                           res.send(theTempDataForGraph);
                         });
                         app.get('/addtheTempNF', function(req,res){
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

                         let sql10 = `SELECT * FROM NF WHERE id ="` + day + `";`
                         console.log(sql10);
                         db.query(sql10, (err, result)=>{
                           var conditions = result[0]
                           res.render('NFdata', {conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})

                         });                      // console.log(twoWeeksAgoData);
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


 //irl-sle

  app.get('/createSLE', function(req,res) {
      let createSLE = `CREATE TABLE SLE (id int AUTO_INCREMENT, date VARCHAR(255), nitrateLevel FLOAT, salineLevel FLOAT, tempLevel FLOAT, PRIMARY KEY (id));`
      db.query(createSLE, (err, result)=>{
        console.log(result);
      })
      //
      let sql5 = `CREATE TABLE SLEnumberPoint (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql5, (err,result)=>{
        console.log(result);
      })
      //
      let sql6 = `CREATE TABLE SLEnumberPointSaline (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql6, (err,result)=>{
        console.log(result);
      })
      //
      let sql8 = `CREATE TABLE SLEnumberPointTemp (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql8, (err,result)=>{
        console.log(result);
      })
      res.render('home')

    })
  app.get('/deleteSLE', function(req,res){
      let SLEsql = `DROP TABLE SLE;`
      db.query(SLEsql, (err,result)=> {
      })
      let SLEnumberPointSQL = `DROP TABLE SLEnumberPoint;`
      db.query(SLEnumberPointSQL, (err,result)=>{
      })
      let SLEsalineSQL = `DROP TABLE SLEnumberPointSaline;`
      db.query(SLEsalineSQL, (err,result)=>{
      })
      let SLEtempSQL = `DROP Table SLEnumberPointTemp;`
      db.query(SLEtempSQL, (err, result)=>{
      })
      res.render('home')
    });
  app.get('/SLE', function(req, res) {


     var SLENitrate = XLSX.readFile('IRL-SLE-Nitrate.xlsx');
     const sheet_name_list = SLENitrate.sheetNames;
     var hello = SLENitrate.Sheets.Sheet1
     var allValues = []
     for(var sequence in hello) {
       allValues.push(SLENitrate.Sheets.Sheet1[sequence].w)
     }
     console.log(allValues.length);
     var numberOfEntries = 0
     var totalForDay = 0.0
     var allValuesJSON = JSON.stringify(allValues);
     allValues.shift()


     console.log("Hello");
     req.session.okay = "hello"
     // ***PUT ALL VALUES INTO DB************************************************************************************************
     for (var i = 0; i < allValues.length; i++) {
       // console.log("All Values == "+ allValues.length); IS WOrkING
       if (i % 3 == 0) {
         var theVariable = JSON.stringify(allValues[i])
         let sql = `INSERT INTO SLEnumberPoint (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
     console.log(allValuesDates);
     //
     //
     uniqueValueDates = allValuesDates.filter( function( item, index, inputArray ) {
            return inputArray.indexOf(item) == index;
     });

     console.log(uniqueValueDates);


     // console.log(uniqueValueDates);
     var array = []
     function getTheAverageSLE(uniqueValueDates, theArray) {
       req.session.hello = 2+3
       for (var i = 0; i < uniqueValueDates.length ; i++) {
         req.session.dates = uniqueValueDates;
         let sql2 = 'SELECT AVG(level) AS averageLevel FROM SLEnumberPoint WHERE date = "' + uniqueValueDates[i] +'";'
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
                  let sql3 = `INSERT INTO SLE (date) VALUES (`+dateString+`);`
                  db.query (sql3, (err, result)=> {
                  })
                  if (z+1 == dates.length) {
                    for (var q = 0; q < array.length; q++) {
                      // console.log("q = "+ q);
                      var theLevel = array[q];
                      var idMatch = q+1;
                      // console.log(idMatch);
                      let sql4 = `UPDATE SLE SET nitrateLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
     getTheAverageSLE(uniqueValueDates, array)
     res.render('nitrateAnalyzedSLE')
     })
  app.get('/salineSLE', function(req, res) {
        var SLESaline = XLSX.readFile('IRL-SLE-Saline.xlsx');
        const sheet_name_list = SLESaline.sheetNames;


        var hello = SLESaline.Sheets.Sheet1
        var allValues = []
        for(var sequence in hello) {
          allValues.push(SLESaline.Sheets.Sheet1[sequence].w)

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
            let sql = `INSERT INTO SLEnumberPointSaline (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
        function getTheAverageSLE(uniqueValueDates, theArray) {
          req.session.hello = 2+3
          for (var i = 0; i < uniqueValueDates.length ; i++) {
            req.session.dates = uniqueValueDates;
            let sql2 = 'SELECT AVG(level) AS averageLevel FROM SLEnumberPointSaline WHERE date = "' + uniqueValueDates[i] +'";'
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
                         let sql4 = `UPDATE SLE SET salineLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
        getTheAverageSLE(uniqueValueDates, array)
        res.render('salineAnalyzedSLE')
        })
  app.get('/SLESearch', function(req, res) {
                       var SLETemp = XLSX.readFile('IRL-SLE-Temp.xlsx');
                       const sheet_name_list = SLETemp.sheetNames;


                       var hello = SLETemp.Sheets.Sheet1
                       var allValues = []
                       for(var sequence in hello) {
                         allValues.push(SLETemp.Sheets.Sheet1[sequence].w)

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
                           let sql = `INSERT INTO SLEnumberPointTemp (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
                       function getTheAverageSLE(uniqueValueDates, theArray) {
                         req.session.hello = 2+3
                         for (var i = 0; i < uniqueValueDates.length ; i++) {
                           req.session.dates = uniqueValueDates;
                           let sql2 = 'SELECT AVG(level) AS averageLevel FROM SLEnumberPointTemp WHERE date = "' + uniqueValueDates[i] +'";'
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
                                        let sql4 = `UPDATE SLE SET tempLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
                       getTheAverageSLE(uniqueValueDates, array)
                       res.render('tempAnalyzedSLE')
                       })
                       app.get('/searchForSiteSLE', function(req, res){
                            res.render('searchForSiteSLE')
                          })
  app.get('/searchForSiteSLE', function(req, res){
       res.render('searchForSiteSLE')
     })
  app.post('/dateSLE', function(req, res){
             let date = req.body.date;
             console.log(date);
             let sql10 = `SELECT * FROM SLE WHERE date ="` + date + `";`
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
               let sql2 = `SELECT * FROM SLE WHERE id > ` + week + ' && id <= '+day+';'
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
                       let sql3 = `SELECT * FROM SLE WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                             //CHECK HERE FOR REFINEMENTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                           if (weekData[i].temp <= 24.4) {
                               points = 0.5
                               OneWeekAgoTempScoreArray.push(points)
                               OneWeekAgoTempScore += points
                             } else if (weekData[i].temp > 24.4 && weekData[i].temp < 28.4) {
                               points = .92
                               OneWeekAgoTempScoreArray.push(points)
                               OneWeekAgoTempScore += points
                             } else if (weekData[i].temp >= 28.4 && weekData[i].temp <= 31.4) {
                               points = 1.05
                               OneWeekAgoTempScoreArray.push(points)
                               OneWeekAgoTempScore += points
                             }else if (weekData[i].temp >=31.4 && weekData[i].temp <= 35) {
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
                             let sql4 = `SELECT * FROM SLE WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                                   var aChanceOfAnAlgaeBloom

                                 var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)


                               var alert
                               var StringChanceOfAnAlgaeBloom
                               if (chanceOfAnAlgaeBloom) {
                                 StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                                 alert = "alert-danger"
                               } else if (!chanceOfAnAlgaeBloom) {
                                 StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                                 alert = "alert-success"
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
                               req.session.londonTempDataForSearchSLE = {
                               // city: 'Florida',
                               // unit: 'celsius',
                                 dataPoints: dataForNitrateForSearch
                               }
                             //
                               req.session.salineForSearchLevelDataForGraphSLE = {
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

                               req.session.theTempDataForGraphForSearchSLE = {
                               // city: 'Florida',
                               // unit: 'celsius',
                                 dataPoints: dataFortheTempForSearch
                               }

                               console.log(req.session.salineForSearchLevelDataForGraphSLE);



                              // for Nitrate
                              req.session.resetCodeForNitrateForSearchSLE = ''
                             app.get('/getTemperatureForSearchSLE'+req.session.resetCodeForNitrateForSearchSLE, function(req,res){
                               res.send(req.session.londonTempDataForSearchSLE);
                             });
                               app.get('/addTemperatureForSearchSLE', function(req,res){
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
                               req.session.resetCodeForSalineForSearchSLE = ''
                               app.get('/getSalineForSearchSLE'+req.session.resetCodeForSalineForSearchSLE, function(req,res){
                                 res.send(req.session.salineForSearchLevelDataForGraphSLE);
                               });
                               app.get('/addSalineForSearchSLE', function(req,res){
                                 var salineForSearch = parseInt(req.query.salineForSearch);
                                 var timeForSearch = parseInt(req.query.timeForSearch);
                                 if(salineForSearch && timeForSearch && !isNaN(salineForSearch) && !isNaN(timeForSearch)){
                                   var newDataPoint = {
                                     saline: salineForSearch,
                                     time: timeForSearch
                                   };
                                   req.session.salineForSearchLevelDataForGraphSLE.dataPoints.push(newDataPoint);
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
                               req.session.resetCodeFortheTempForSearchSLE = ''
                               app.get('/gettheTempForSearchSLE'+req.session.resetCodeFortheTempForSearchSLE, function(req,res){
                                 res.send(req.session.theTempDataForGraphForSearchSLE);
                               });
                               app.get('/addtheTempForSearchSLE', function(req,res){
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
                             res.render('index4SLE', {alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})

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
  app.get('/resetSearchSLE', function(req, res,) {
               req.session.resetCodeForSalineForSearchSLE = "reset"
               req.session.resetCodeForNitrateForSearchSLE = "reset"
               req.session.resetCodeFortheTempForSearchSLE = "reset"

               app.get('/getSalineForSearchSLE'+req.session.resetCodeForSalineForSearchSLE, function(req,res){
                 res.send(req.session.salineForSearchLevelDataForGraphSLE);
               });
              app.get('/getTemperatureForSearchSLE'+req.session.resetCodeForNitrateForSearchSLE, function(req,res){
                res.send(req.session.londonTempDataForSearchSLE);
              });
              app.get('/gettheTempForSearchSLE'+req.session.resetCodeFortheTempForSearchFP, function(req,res){
                res.send(req.session.londonTempDataForSearchSLE);
              });
               res.redirect('/')
      })
  app.get('/SLEdata', function (req, res) {
          let sql = 'SELECT COUNT(*) FROM SLE'
          db.query (sql, (err, result)=>{
            var day = result[0]["COUNT(*)"]
            var week = day - 7
            let sql2 = `SELECT * FROM SLE WHERE id > ` + week + ';'
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
                        score = .125
                        nitrateSalineScore += score
                        nitrateSalineScoreArray.push(score)

                      } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                        score = .25
                        nitrateSalineScore += score
                        nitrateSalineScoreArray.push(score)

                      } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                        score = .375
                        nitrateSalineScore += score
                        nitrateSalineScoreArray.push(score)

                      } else if (weekData[i].salineLevel < 2) {
                        score = .5
                        nitrateSalineScore += score
                        nitrateSalineScoreArray.push(score)
                      }
                    } else if (weekData[i].nitrateLevel <= 9 && weekData[i].nitrateLevel >= 6) {
                      if (weekData[i].salineLevel >= 23) {
                        score = .25
                        nitrateSalineScore += score
                        nitrateSalineScoreArray.push(score)

                      } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel > 15) {
                        score = .375
                        nitrateSalineScore += score
                        nitrateSalineScoreArray.push(score)

                      } else if (weekData[i].salineLevel <= 15 && weekData[i].salineLevel >= 2) {
                        score = 1
                        nitrateSalineScore += score
                        nitrateSalineScoreArray.push(score)

                      } else if (weekData[i].salineLevel < 2) {
                        score = 1.5
                        nitrateSalineScore += score
                        nitrateSalineScoreArray.push(score)
                      }
                    } else if (weekData[i].nitrateLevel < 12 && weekData[i].nitrateLevel > 9) {
                      if (weekData[i].salineLevel >= 23) {
                        score = .5
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
                        score = 1.5
                        nitrateSalineScore += score
                        nitrateSalineScoreArray.push(score)
                      }
                    } else if (weekData[i].nitrateLevel >= 12) {
                      if (weekData[i].salineLevel >= 23) {
                        score = .75
                        nitrateSalineScore += score
                        nitrateSalineScoreArray.push(score)

                      } else if (weekData[i].salineLevel < 23 && weekData[i].salineLevel >= 15) {
                        score = 1
                        nitrateSalineScore += score
                        nitrateSalineScoreArray.push(score)

                      } else if (weekData[i].salineLevel < 15 && weekData[i].salineLevel >= 2) {
                        score = 1.25
                        nitrateSalineScore += score
                        nitrateSalineScoreArray.push(score)

                      } else if (weekData[i].salineLevel < 2) {
                        score = 2
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
                  let sql3 = `SELECT * FROM SLE WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                        let sql4 = `SELECT * FROM SLE WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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


                              var aChanceOfAnAlgaeBloom

                            var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)


                          var StringChanceOfAnAlgaeBloom
                          var alert
                          if (chanceOfAnAlgaeBloom) {
                            StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                            alert = "alert-danger"
                          } else if (!chanceOfAnAlgaeBloom) {
                            StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                            alert = "alert-success"
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
                          app.get('/getTemperatureSLE', function(req,res){ //styppsxd
                          res.send(londonTempData);
                        });
                          app.get('/addTemperatureSLE', function(req,res){
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
                          app.get('/getSalineSLE', function(req,res){
                            res.send(salineLevelDataForGraph);
                          });
                          app.get('/addSalineSLE', function(req,res){
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
                          app.get('/gettheTempSLE', function(req,res){
                            res.send(theTempDataForGraph);
                          });
                          app.get('/addtheTempSLE', function(req,res){
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

                          let sql10 = `SELECT * FROM SLE WHERE id ="` + day + `";`
                          console.log(sql10);
                          db.query(sql10, (err, result)=>{
                            var conditions = result[0]
                            res.render('SLEdata', {conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})

                          });                      // console.log(twoWeeksAgoData);
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















// END

//source Code in test.js
function determineChanceOfAlgaeBloom(theMonthData, theNitrateSalineSlope, theTempSlope, theChanceOfAnAlgaeBloom) {
  //temp: 7.15
  //nitrate: 6.85

  if (theMonthData.firstWeekNitrateSalineScore >= 6.85 && theMonthData.firstWeekNitrateSalineScore <= 8.15) {
    if (theMonthData.secondWeekNitrateSalineScore >= 5.85) {
      if (theMonthData.thirdWeekNitrateSalineScore >= 3.50) {
        if (theMonthData.firstWeekTempScore >= 7.15) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekTempScore >= 6.75 && theMonthData.secondWeekTempScore >= 6.65 && theMonthData.thirdWeekTempScore >= 6.55  ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekNitrateSalineScore >= 8 && theMonthData.firstWeekTempScore >= 6.35 ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        }
      } else if (theMonthData.thirdWeekNitrateSalineScore >= 2 && onthData.secondWeekNitrateSalineScore >= 6.85) {
        if (theMonthData.firstWeekTempScore >= 7.15) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekTempScore >= 6.75 && theMonthData.secondWeekTempScore >= 6.65 && theMonthData.thirdWeekTempScore >= 6.55  ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekNitrateSalineScore >= 8 && theMonthData.firstWeekTempScore >= 6.35 ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        }
      } else {
        theChanceOfAnAlgaeBloom = false
      }
    } else if (theMonthData.secondWeekNitrateSalineScore >= 5 && theMonthData.firstWeekNitrateSalineScore >=7.15 ) {
      if (theMonthData.thirdWeekNitrateSalineScore >= 3.50) {
        if (theMonthData.firstWeekTempScore >= 7.15) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekTempScore >= 6.75 && theMonthData.secondWeekTempScore >= 6.65 && theMonthData.thirdWeekTempScore >= 6.55  ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekNitrateSalineScore >= 8 && theMonthData.firstWeekTempScore >= 6.35 ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        }
      } else if (theMonthData.thirdWeekNitrateSalineScore >= 2 && onthData.secondWeekNitrateSalineScore >= 6.85) {
        if (theMonthData.firstWeekTempScore >= 7.15) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekTempScore >= 6.75 && theMonthData.secondWeekTempScore >= 6.65 && theMonthData.thirdWeekTempScore >= 6.55  ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekNitrateSalineScore >= 8 && theMonthData.firstWeekTempScore >= 6.35 ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        }
      } else {
        theChanceOfAnAlgaeBloom = false
      }
    } else {
      theChanceOfAnAlgaeBloom = false
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++
  } else if (theMonthData.firstWeekNitrateSalineScore >= 5.75 && theMonthData.firstWeekNitrateSalineScore <= 6.85 && theMonthData.firstWeekTempScore >= 7.65) {
    if (theMonthData.secondWeekNitrateSalineScore >= 5.85) {
      if (theMonthData.thirdWeekNitrateSalineScore >= 3.50) {
        if (theMonthData.firstWeekTempScore >= 7.15) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekTempScore >= 6.75 && theMonthData.secondWeekTempScore >= 6.65 && theMonthData.thirdWeekTempScore >= 6.55  ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekNitrateSalineScore >= 8 && theMonthData.firstWeekTempScore >= 6.35 ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        }
      } else if (theMonthData.thirdWeekNitrateSalineScore >= 2 && onthData.secondWeekNitrateSalineScore >= 6.85) {
        if (theMonthData.firstWeekTempScore >= 7.15) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekTempScore >= 6.75 && theMonthData.secondWeekTempScore >= 6.65 && theMonthData.thirdWeekTempScore >= 6.55  ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekNitrateSalineScore >= 8 && theMonthData.firstWeekTempScore >= 6.35 ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        }
      } else {
        theChanceOfAnAlgaeBloom = false
      }
    } else if (theMonthData.secondWeekNitrateSalineScore >= 5 && theMonthData.firstWeekNitrateSalineScore >=7.15 ) {
      if (theMonthData.thirdWeekNitrateSalineScore >= 3.50) {
        if (theMonthData.firstWeekTempScore >= 7.15) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekTempScore >= 6.75 && theMonthData.secondWeekTempScore >= 6.65 && theMonthData.thirdWeekTempScore >= 6.55  ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekNitrateSalineScore >= 8 && theMonthData.firstWeekTempScore >= 6.35 ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        }
      } else if (theMonthData.thirdWeekNitrateSalineScore >= 2 && onthData.secondWeekNitrateSalineScore >= 6.85) {
        if (theMonthData.firstWeekTempScore >= 7.15) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekTempScore >= 6.75 && theMonthData.secondWeekTempScore >= 6.65 && theMonthData.thirdWeekTempScore >= 6.55  ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        } else if (theMonthData.firstWeekNitrateSalineScore >= 8 && theMonthData.firstWeekTempScore >= 6.35 ) {
          if (theNitrateSalineSlope >= 0) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -1 && theNitrateSalineSlope <= -.5 && theMonthData.secondWeekNitrateSalineScore >= 6.95) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else if (theNitrateSalineSlope >= -.5) {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          } else {
            if (theTempSlope >= 0) {
              theChanceOfAnAlgaeBloom = true
            } else if (theTempSlope >= -1 && theMonthData.firstWeekTempScore >= 7.85 && theMonthData.secondWeekTempScore >= 7.05) {
              theChanceOfAnAlgaeBloom = true
            } else {
              theChanceOfAnAlgaeBloom = false
            }
          }
        }
      } else {
        theChanceOfAnAlgaeBloom = false
      }
    } else {
      theChanceOfAnAlgaeBloom = false
    }
  } else if (theMonthData.firstWeekNitrateSalineScore >= 8.15) {
    if (theMonthData.firstWeekTempScore >= 4 ) {
      theChanceOfAnAlgaeBloom = true
    }
  } else {
    theChanceOfAnAlgaeBloom = false
  }


  return theChanceOfAnAlgaeBloom
}








};
