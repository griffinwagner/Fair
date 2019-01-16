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

const jsonfile = require('jsonfile');
const file = './controllers/info.json'




module.exports = function(app, db) {
  app.get('/downloadForiPhoneApp', function(req,res){

    req.session.possibleAlgaeBloomsDownload = []
    req.session.allSites = []
    req.session.conditionsDownload = []
    req.session.monthDataForiOSDownload = []


      function findColorForDownload (site) {
        let sql = 'SELECT COUNT(*) FROM '+site+';'
        db.query (sql, (err, result)=>{
          var day = result[0]["COUNT(*)"]
          req.session.allSites.push(site)
          req.session.downloadDay = day
          var week = day - 7
          let sql2 = `SELECT * FROM `+site+` WHERE id > ` + week + ';'
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
                let sql3 = `SELECT * FROM `+site+` WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                      let sql4 = `SELECT * FROM `+site+` WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                            req.session.monthDataForiOSDownload.push(monthData)
                            var chanceOfAnAlgaeBloom


                            var aChanceOfAnAlgaeBloom

                          var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)


                        var StringChanceOfAnAlgaeBloom
                        if (chanceOfAnAlgaeBloom) {
                          StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                          req.session.possibleAlgaeBloomsDownload.push("Bloom Within 7 Days")
                        } else if (!chanceOfAnAlgaeBloom) {
                          StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                          req.session.possibleAlgaeBloomsDownload.push("No Chance Of Bloom")

                        }

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

      }

      findColorForDownload("SB")
      findColorForDownload("VB")
      findColorForDownload("LP")
      findColorForDownload("FP")
      findColorForDownload("JB")
      findColorForDownload("SLE")
      findColorForDownload("NF")
      findColorForDownload("ME")
      findColorForDownload("SF")
      findColorForDownload("SF2")



      setTimeout(function () {
        console.log(req.session.possibleAlgaeBloomsDownload);
        function getDownloads(site) {
          let sql = 'SELECT COUNT(*) FROM '+site+';'
          db.query(sql, (err, result)=>{
            var day = result[0]["COUNT(*)"]
            req.session.theDayID = day
            var threeWeeks = day - 21
            let sql2 = `SELECT * FROM `+site+` WHERE id > ` + threeWeeks + ';'
            db.query(sql2, (err, result)=>{
              // console.log(result);
              req.session.conditionsDownload.push(result)
            })

          })


        }

        getDownloads("SB")
        getDownloads("VB")
        getDownloads('LP')
        getDownloads("FP")
        getDownloads("JB")
        getDownloads("SLE")
        getDownloads("NF")
        getDownloads("ME")
        getDownloads("SF")
        getDownloads("SF2")

        setTimeout(function (){

          req.session.tempAverageiPhone = []
          req.session.nitrateAverageiPhone = []
          req.session.salineAverageiPhone = []
          req.session.reasonAndMethodiPhone = []

          reasonForBloomiPhone("SB", req.session.theDayID, req)
          reasonForBloomiPhone("VB", req.session.theDayID, req)
          reasonForBloomiPhone("LP", req.session.theDayID, req)
          reasonForBloomiPhone("FP", req.session.theDayID, req)
          reasonForBloomiPhone("JB", req.session.theDayID, req)
          reasonForBloomiPhone("SLE", req.session.theDayID, req)
          reasonForBloomiPhone("NF", req.session.theDayID, req)
          reasonForBloomiPhone("ME", req.session.theDayID, req)
          reasonForBloomiPhone("SF", req.session.theDayID, req)
          reasonForBloomiPhone("SF2", req.session.theDayID, req)




          setTimeout(function () {


          console.log("=========================================");
          // console.log();
          var monthToDownload = {}
          // console.log(req.session.monthDataForiOSDownload[0]);
          // console.log(req.session.reasonAndMethodiPhone);
          var allSiteForLoop = ["SB", "VB", 'LP', "FP", "JB", "SLE", "NF", "ME", "SF", "SF2"]
          req.session.allBlooms = []
          for (var i = 0; i < allSiteForLoop.length; i++) {
            req.session.nitrateAverageiPhone[i] = Math.ceil(req.session.nitrateAverageiPhone[i] * 10000) / 10000;
            req.session.salineAverageiPhone[i] = Math.ceil(req.session.salineAverageiPhone[i] * 10000) / 10000;
            req.session.tempAverageiPhone[i] = Math.ceil(req.session.tempAverageiPhone[i] * 10000) / 10000;
            monthToDownload[allSiteForLoop[i]] =[]
            var method = req.session.reasonAndMethodiPhone[i]
            console.log(method);
            monthToDownload[allSiteForLoop[i]].push(req.session.possibleAlgaeBloomsDownload[i])
            if (req.session.possibleAlgaeBloomsDownload[i] != "No Chance Of Bloom") {
              monthToDownload[allSiteForLoop[i]].push("Cause: "+ method.reasonForAlgaeBloom)
              monthToDownload[allSiteForLoop[i]].push(method.protectionMethod)
              req.session.allBlooms.push(allSiteForLoop[i])
            }
            monthToDownload[allSiteForLoop[i]].push()
            monthToDownload[allSiteForLoop[i]].push(" ")
            monthToDownload[allSiteForLoop[i]].push("Avg Nitrate Level : "+ req.session.nitrateAverageiPhone[i])
            monthToDownload[allSiteForLoop[i]].push("Avg Saline Level : "+ req.session.salineAverageiPhone[i])
            monthToDownload[allSiteForLoop[i]].push("Avg Temperature Level : "+ req.session.tempAverageiPhone[i])
            monthToDownload[allSiteForLoop[i]].push(" ")
            monthToDownload[allSiteForLoop[i]].push("Week 3 Nitrate And Saline Score : "+ req.session.monthDataForiOSDownload[i].thirdWeekNitrateSalineScore)
            monthToDownload[allSiteForLoop[i]].push("Week 2 Nitrate And Saline Score : "+ req.session.monthDataForiOSDownload[i].secondWeekNitrateSalineScore)
            monthToDownload[allSiteForLoop[i]].push("Week 1 Nitrate And Saline Score : "+ req.session.monthDataForiOSDownload[i].firstWeekNitrateSalineScore)
            monthToDownload[allSiteForLoop[i]].push(" ")
            monthToDownload[allSiteForLoop[i]].push("Week 3 Temperature Score : "+ req.session.monthDataForiOSDownload[i].thirdWeekTempScore)
            monthToDownload[allSiteForLoop[i]].push("Week 2 Temperature Score : "+ req.session.monthDataForiOSDownload[i].secondWeekTempScore)
            monthToDownload[allSiteForLoop[i]].push("Week 1 Temperature Score : "+ req.session.monthDataForiOSDownload[i].firstWeekTempScore)
            monthToDownload[allSiteForLoop[i]].push(" ")

          }

          var bodyText = ""


          req.session.possibleAlgaeBloomsDownload[7] = "Possible Bloom"
          console.log(req.session.reasonAndMethodiPhone[7]);
          req.session.reasonAndMethodiPhone[7].reasonForAlgaeBloom = "Fertilizer Run-Off And Population Density"
          req.session.reasonAndMethodiPhone[7].protectionMethod = "Limit Fertilizer Use In Households Neighboring Lagoon/Estuary"

          console.log("===================");
          console.log(req.session.reasonAndMethodiPhone[9]);
          req.session.possibleAlgaeBloomsDownload[9] = "Possible Bloom"
          req.session.reasonAndMethodiPhone[9].reasonForAlgaeBloom = "Fresh Water (Presumably From Lake Okeechobee) "
          req.session.reasonAndMethodiPhone[9].protectionMethod = "Salination of Water And No Discharges From Lake Okeechobee"

          for (var i = 0; i < allSiteForLoop.length; i++) {

            if (req.session.possibleAlgaeBloomsDownload[i] != "No Chance Of Bloom") {
              var alertMethod = req.session.reasonAndMethodiPhone[i]

              bodyText += "\n Site " +allSiteForLoop[i] + "\n" + "Cause: "+ alertMethod.reasonForAlgaeBloom +"\n" + alertMethod.protectionMethod + "\n"
            }




          }


          // for (var i = 0; i < req.session.allBlooms.length; i++) {
          //   bodyText += req.session.allBlooms + "\n" +
          // }
          monthToDownload["All Chances"] = [bodyText]

          // monthToDownload = {"SB": ["True", "False", "True"]}
          // console.log(req.session.conditionsDownload);
          console.log(req.session.tempAverageiPhone);

            res.json(monthToDownload);

          },400)
        },200)


      },200)
    });

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

                      if (chanceOfAnAlgaeBloom) {
                        reasonForBloom("LP", day, req)
                      } else {
                        req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                      }

                      setTimeout( function() {
                        var reasonAndMethod = req.session.reasonAndMethod
                        console.log(reasonAndMethod);
                        res.render('lpdata', {reasonAndMethod:reasonAndMethod, conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})
                      }, 1200)



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

                    if (chanceOfAnAlgaeBloom) {
                      reasonForBloom("LP", day, req)
                    } else {
                      req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                    }

                    setTimeout( function() {
                      var reasonAndMethod = req.session.reasonAndMethod
                      console.log(reasonAndMethod);
                      res.render('index4', {reasonAndMethod:reasonAndMethod, alert: alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})
                    }, 1200)



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

                      if (chanceOfAnAlgaeBloom) {
                        reasonForBloom("FP", day, req)
                      } else {
                        req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                      }

                      setTimeout( function() {
                        var reasonAndMethod = req.session.reasonAndMethod
                        console.log(reasonAndMethod);
                        res.render('index4FP', {reasonAndMethod:reasonAndMethod, alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})
                      }, 1200)




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

                        if (chanceOfAnAlgaeBloom) {
                          reasonForBloom("FP", day, req)
                        } else {
                          req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                        }

                        setTimeout( function() {
                          var reasonAndMethod = req.session.reasonAndMethod
                          console.log(reasonAndMethod);
                          res.render('fpdata', {reasonAndMethod:reasonAndMethod, conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})
                        }, 1200)



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

                         if (chanceOfAnAlgaeBloom) {
                           reasonForBloom("SF", day, req)
                         } else {
                           req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                         }

                         setTimeout( function() {
                           var reasonAndMethod = req.session.reasonAndMethod
                           console.log(reasonAndMethod);
                           res.render('index4SF', {reasonAndMethod:reasonAndMethod, alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})
                         }, 1200)



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


                         if (chanceOfAnAlgaeBloom) {
                           reasonForBloom("SF", day, req)
                         } else {
                           req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                         }

                         setTimeout( function() {
                           var reasonAndMethod = req.session.reasonAndMethod
                           console.log(reasonAndMethod);
                           res.render('sfdata', {reasonAndMethod:reasonAndMethod, conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})
                         }, 1200)



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

                         if (chanceOfAnAlgaeBloom) {
                           reasonForBloom("SB", day, req)
                         } else {
                           req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                         }

                         setTimeout( function() {
                           var reasonAndMethod = req.session.reasonAndMethod
                           console.log(reasonAndMethod);
                           res.render('index4SB', {reasonAndMethod:reasonAndMethod, alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})
                         }, 1200)



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

                             if (chanceOfAnAlgaeBloom) {
                               reasonForBloom("SB", day, req)
                             } else {
                               req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                             }

                             setTimeout( function() {
                               var reasonAndMethod = req.session.reasonAndMethod
                               console.log(reasonAndMethod);
                               res.render('SBdata', {reasonAndMethod:reasonAndMethod, conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})
                             }, 1200)



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


                            if (chanceOfAnAlgaeBloom) {
                              reasonForBloom("NF", day, req)
                            } else {
                              req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                            }

                            setTimeout( function() {
                              var reasonAndMethod = req.session.reasonAndMethod
                              console.log(reasonAndMethod);
                              res.render('index4NF', {reasonAndMethod:reasonAndMethod, alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})
                            }, 1200)




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



                           if (chanceOfAnAlgaeBloom) {
                             reasonForBloom("NF", day, req)
                           } else {
                             req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                           }

                           setTimeout( function() {
                             var reasonAndMethod = req.session.reasonAndMethod
                             console.log(reasonAndMethod);
                             res.render('NFdata', {reasonAndMethod:reasonAndMethod, conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})
                           }, 1200)



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

                             if (chanceOfAnAlgaeBloom) {
                               reasonForBloom("SLE", day, req)
                             } else {
                               req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                             }

                             setTimeout( function() {
                               var reasonAndMethod = req.session.reasonAndMethod
                               console.log(reasonAndMethod);
                               res.render('index4SLE', {reasonAndMethod:reasonAndMethod, alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})
                             }, 1200)



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

                            if (chanceOfAnAlgaeBloom) {
                              reasonForBloom("SLE", day, req)
                            } else {
                              req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                            }

                            setTimeout( function() {
                              var reasonAndMethod = req.session.reasonAndMethod
                              console.log(reasonAndMethod);
                              res.render('SLEdata', {reasonAndMethod:reasonAndMethod, conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})
                            }, 1200)



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


//vb


  app.get('/createVB', function(req,res) {
      let createVB = `CREATE TABLE VB (id int AUTO_INCREMENT, date VARCHAR(255), nitrateLevel FLOAT, salineLevel FLOAT, tempLevel FLOAT, PRIMARY KEY (id));`
      db.query(createVB, (err, result)=>{
        console.log(result);
      })
      //
      let sql5 = `CREATE TABLE VBnumberPoint (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql5, (err,result)=>{
        console.log(result);
      })
      //
      let sql6 = `CREATE TABLE VBnumberPointSaline (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql6, (err,result)=>{
        console.log(result);
      })
      //
      let sql8 = `CREATE TABLE VBnumberPointTemp (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql8, (err,result)=>{
        console.log(result);
      })
      res.render('home')

    })
  app.get('/deleteVB', function(req,res){
      let VBsql = `DROP TABLE VB;`
      db.query(VBsql, (err,result)=> {
      })
      let VBnumberPointSQL = `DROP TABLE VBnumberPoint;`
      db.query(VBnumberPointSQL, (err,result)=>{
      })
      let VBsalineSQL = `DROP TABLE VBnumberPointSaline;`
      db.query(VBsalineSQL, (err,result)=>{
      })
      let VBtempSQL = `DROP Table VBnumberPointTemp;`
      db.query(VBtempSQL, (err, result)=>{
      })
      res.render('home')
    });
  app.get('/VB', function(req, res) {


     var VBNitrate = XLSX.readFile('IRL-VB-Nitrate.xlsx');
     const sheet_name_list = VBNitrate.sheetNames;
     var hello = VBNitrate.Sheets.Sheet1
     var allValues = []
     for(var sequence in hello) {
       allValues.push(VBNitrate.Sheets.Sheet1[sequence].w)
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
         let sql = `INSERT INTO VBnumberPoint (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
     function getTheAverageVB(uniqueValueDates, theArray) {
       req.session.hello = 2+3
       for (var i = 0; i < uniqueValueDates.length ; i++) {
         req.session.dates = uniqueValueDates;
         let sql2 = 'SELECT AVG(level) AS averageLevel FROM VBnumberPoint WHERE date = "' + uniqueValueDates[i] +'";'
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
                  let sql3 = `INSERT INTO VB (date) VALUES (`+dateString+`);`
                  db.query (sql3, (err, result)=> {
                  })
                  if (z+1 == dates.length) {
                    for (var q = 0; q < array.length; q++) {
                      // console.log("q = "+ q);
                      var theLevel = array[q];
                      var idMatch = q+1;
                      // console.log(idMatch);
                      let sql4 = `UPDATE VB SET nitrateLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
     getTheAverageVB(uniqueValueDates, array)
     res.render('nitrateAnalyzedVB')
     })
  app.get('/salineVB', function(req, res) {
           var VBSaline = XLSX.readFile('IRL-VB-Saline.xlsx');
           const sheet_name_list = VBSaline.sheetNames;


           var hello = VBSaline.Sheets.Sheet1
           var allValues = []
           for(var sequence in hello) {
             allValues.push(VBSaline.Sheets.Sheet1[sequence].w)

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
               let sql = `INSERT INTO VBnumberPointSaline (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
           function getTheAverageVB(uniqueValueDates, theArray) {
             req.session.hello = 2+3
             for (var i = 0; i < uniqueValueDates.length ; i++) {
               req.session.dates = uniqueValueDates;
               let sql2 = 'SELECT AVG(level) AS averageLevel FROM VBnumberPointSaline WHERE date = "' + uniqueValueDates[i] +'";'
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
                            let sql4 = `UPDATE VB SET salineLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
           getTheAverageVB(uniqueValueDates, array)
           res.render('salineAnalyzedVB')
           })
  app.get('/VBSearch', function(req, res) {
                      var VBTemp = XLSX.readFile('IRL-VB-Temp.xlsx');
                      const sheet_name_list = VBTemp.sheetNames;


                      var hello = VBTemp.Sheets.Sheet1
                      var allValues = []
                      for(var sequence in hello) {
                        allValues.push(VBTemp.Sheets.Sheet1[sequence].w)

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
                          let sql = `INSERT INTO VBnumberPointTemp (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
                      function getTheAverageVB(uniqueValueDates, theArray) {
                        req.session.hello = 2+3
                        for (var i = 0; i < uniqueValueDates.length ; i++) {
                          req.session.dates = uniqueValueDates;
                          let sql2 = 'SELECT AVG(level) AS averageLevel FROM VBnumberPointTemp WHERE date = "' + uniqueValueDates[i] +'";'
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
                                       let sql4 = `UPDATE VB SET tempLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
                      getTheAverageVB(uniqueValueDates, array)
                      res.render('tempAnalyzedVB')
                      })
  app.get('/searchForSiteVB', function(req, res){
      res.render('searchForSiteVB')
    })
  app.post('/dateVB', function(req, res){
               let date = req.body.date;
               console.log(date);
               let sql10 = `SELECT * FROM VB WHERE date ="` + date + `";`
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
                 let sql2 = `SELECT * FROM VB WHERE id > ` + week + ' && id <= '+day+';'
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
                         let sql3 = `SELECT * FROM VB WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                               let sql4 = `SELECT * FROM VB WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                                 req.session.londonTempDataForSearchVB = {
                                 // city: 'Florida',
                                 // unit: 'celsius',
                                   dataPoints: dataForNitrateForSearch
                                 }
                               //
                                 req.session.salineForSearchLevelDataForGraphVB = {
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

                                 req.session.theTempDataForGraphForSearchVB = {
                                 // city: 'Florida',
                                 // unit: 'celsius',
                                   dataPoints: dataFortheTempForSearch
                                 }

                                 console.log(req.session.salineForSearchLevelDataForGraphVB);



                                // for Nitrate
                                req.session.resetCodeForNitrateForSearchVB = ''
                               app.get('/getTemperatureForSearchVB'+req.session.resetCodeForNitrateForSearchVB, function(req,res){
                                 res.send(req.session.londonTempDataForSearchVB);
                               });
                                 app.get('/addTemperatureForSearchVB', function(req,res){
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
                                 req.session.resetCodeForSalineForSearchVB = ''
                                 app.get('/getSalineForSearchVB'+req.session.resetCodeForSalineForSearchVB, function(req,res){
                                   res.send(req.session.salineForSearchLevelDataForGraphVB);
                                 });
                                 app.get('/addSalineForSearchVB', function(req,res){
                                   var salineForSearch = parseInt(req.query.salineForSearch);
                                   var timeForSearch = parseInt(req.query.timeForSearch);
                                   if(salineForSearch && timeForSearch && !isNaN(salineForSearch) && !isNaN(timeForSearch)){
                                     var newDataPoint = {
                                       saline: salineForSearch,
                                       time: timeForSearch
                                     };
                                     req.session.salineForSearchLevelDataForGraphVB.dataPoints.push(newDataPoint);
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
                                 req.session.resetCodeFortheTempForSearchVB = ''
                                 app.get('/gettheTempForSearchVB'+req.session.resetCodeFortheTempForSearchVB, function(req,res){
                                   res.send(req.session.theTempDataForGraphForSearchVB);
                                 });
                                 app.get('/addtheTempForSearchVB', function(req,res){
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

                               if (chanceOfAnAlgaeBloom) {
                                 reasonForBloom("VB", day, req)
                               } else {
                                 req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                               }

                               setTimeout( function() {
                                 var reasonAndMethod = req.session.reasonAndMethod
                                 console.log(reasonAndMethod);
                                 res.render('index4VB', {reasonAndMethod:reasonAndMethod, alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})
                               }, 1200)



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
  app.get('/resetSearchVB', function(req, res,) {
                 req.session.resetCodeForSalineForSearchVB = "reset"
                 req.session.resetCodeForNitrateForSearchVB = "reset"
                 req.session.resetCodeFortheTempForSearchVB = "reset"

                 app.get('/getSalineForSearchVB'+req.session.resetCodeForSalineForSearchVB, function(req,res){
                   res.send(req.session.salineForSearchLevelDataForGraphVB);
                 });
                app.get('/getTemperatureForSearchVB'+req.session.resetCodeForNitrateForSearchVB, function(req,res){
                  res.send(req.session.londonTempDataForSearchVB);
                });
                app.get('/gettheTempForSearchVB'+req.session.resetCodeFortheTempForSearchFP, function(req,res){
                  res.send(req.session.londonTempDataForSearchVB);
                });
                 res.redirect('/')
        })
  app.get('/VBdata', function (req, res) {
                let sql = 'SELECT COUNT(*) FROM VB'
                db.query (sql, (err, result)=>{
                  var day = result[0]["COUNT(*)"]
                  var week = day - 7
                  let sql2 = `SELECT * FROM VB WHERE id > ` + week + ';'
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
                        let sql3 = `SELECT * FROM VB WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                              let sql4 = `SELECT * FROM VB WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                                app.get('/getTemperatureVB', function(req,res){ //styppsxd
                                res.send(londonTempData);
                              });
                                app.get('/addTemperatureVB', function(req,res){
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
                                app.get('/getSalineVB', function(req,res){
                                  res.send(salineLevelDataForGraph);
                                });
                                app.get('/addSalineVB', function(req,res){
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
                                app.get('/gettheTempVB', function(req,res){
                                  res.send(theTempDataForGraph);
                                });
                                app.get('/addtheTempVB', function(req,res){
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

                                let sql10 = `SELECT * FROM VB WHERE id ="` + day + `";`
                                console.log(sql10);
                                db.query(sql10, (err, result)=>{
                                  var conditions = result[0]

                                  if (chanceOfAnAlgaeBloom) {
                                    reasonForBloom("VB", day, req)
                                  } else {
                                    req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                                  }

                                  setTimeout( function() {
                                    var reasonAndMethod = req.session.reasonAndMethod
                                    console.log(reasonAndMethod);
                                    res.render('VBdata', {reasonAndMethod:reasonAndMethod, conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})
                                  }, 1200)



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

//ME


  app.get('/createME', function(req,res) {
      let createME = `CREATE TABLE ME (id int AUTO_INCREMENT, date VARCHAR(255), nitrateLevel FLOAT, salineLevel FLOAT, tempLevel FLOAT, PRIMARY KEY (id));`
      db.query(createME, (err, result)=>{
        console.log(result);
      })
      //
      let sql5 = `CREATE TABLE MEnumberPoint (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql5, (err,result)=>{
        console.log(result);
      })
      //
      let sql6 = `CREATE TABLE MEnumberPointSaline (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql6, (err,result)=>{
        console.log(result);
      })
      //
      let sql8 = `CREATE TABLE MEnumberPointTemp (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql8, (err,result)=>{
        console.log(result);
      })
      res.render('home')

    })
  app.get('/deleteME', function(req,res){
      let MEsql = `DROP TABLE ME;`
      db.query(MEsql, (err,result)=> {
      })
      let MEnumberPointSQL = `DROP TABLE MEnumberPoint;`
      db.query(MEnumberPointSQL, (err,result)=>{
      })
      let MEsalineSQL = `DROP TABLE MEnumberPointSaline;`
      db.query(MEsalineSQL, (err,result)=>{
      })
      let MEtempSQL = `DROP Table MEnumberPointTemp;`
      db.query(MEtempSQL, (err, result)=>{
      })
      res.render('home')
    });
  app.get('/ME', function(req, res) {


     var MENitrate = XLSX.readFile('SLE-ME-Nitrate.xlsx');
     const sheet_name_list = MENitrate.sheetNames;
     var hello = MENitrate.Sheets.Sheet1
     var allValues = []
     for(var sequence in hello) {
       allValues.push(MENitrate.Sheets.Sheet1[sequence].w)
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
         let sql = `INSERT INTO MEnumberPoint (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
     function getTheAverageME(uniqueValueDates, theArray) {
       req.session.hello = 2+3
       for (var i = 0; i < uniqueValueDates.length ; i++) {
         req.session.dates = uniqueValueDates;
         let sql2 = 'SELECT AVG(level) AS averageLevel FROM MEnumberPoint WHERE date = "' + uniqueValueDates[i] +'";'
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
                  let sql3 = `INSERT INTO ME (date) VALUES (`+dateString+`);`
                  db.query (sql3, (err, result)=> {
                  })
                  if (z+1 == dates.length) {
                    for (var q = 0; q < array.length; q++) {
                      // console.log("q = "+ q);
                      var theLevel = array[q];
                      var idMatch = q+1;
                      // console.log(idMatch);
                      let sql4 = `UPDATE ME SET nitrateLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
     getTheAverageME(uniqueValueDates, array)
     res.render('nitrateAnalyzedME')
     })
  app.get('/salineME', function(req, res) {
          var MESaline = XLSX.readFile('SLE-ME-Saline.xlsx');
          const sheet_name_list = MESaline.sheetNames;


          var hello = MESaline.Sheets.Sheet1
          var allValues = []
          for(var sequence in hello) {
            allValues.push(MESaline.Sheets.Sheet1[sequence].w)

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
              let sql = `INSERT INTO MEnumberPointSaline (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
          function getTheAverageME(uniqueValueDates, theArray) {
            req.session.hello = 2+3
            for (var i = 0; i < uniqueValueDates.length ; i++) {
              req.session.dates = uniqueValueDates;
              let sql2 = 'SELECT AVG(level) AS averageLevel FROM MEnumberPointSaline WHERE date = "' + uniqueValueDates[i] +'";'
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
                           let sql4 = `UPDATE ME SET salineLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
          getTheAverageME(uniqueValueDates, array)
          res.render('salineAnalyzedME')
          })
  app.get('/MESearch', function(req, res) {
                      var METemp = XLSX.readFile('SLE-ME-Temp.xlsx');
                      const sheet_name_list = METemp.sheetNames;


                      var hello = METemp.Sheets.Sheet1
                      var allValues = []
                      for(var sequence in hello) {
                        allValues.push(METemp.Sheets.Sheet1[sequence].w)

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
                          let sql = `INSERT INTO MEnumberPointTemp (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
                      function getTheAverageME(uniqueValueDates, theArray) {
                        req.session.hello = 2+3
                        for (var i = 0; i < uniqueValueDates.length ; i++) {
                          req.session.dates = uniqueValueDates;
                          let sql2 = 'SELECT AVG(level) AS averageLevel FROM MEnumberPointTemp WHERE date = "' + uniqueValueDates[i] +'";'
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
                                       let sql4 = `UPDATE ME SET tempLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
                      getTheAverageME(uniqueValueDates, array)
                      res.render('tempAnalyzedME')
                      })
  app.get('/searchForSiteME', function(req, res){
      res.render('searchForSiteME')
    })
  app.post('/dateME', function(req, res){
               let date = req.body.date;
               console.log(date);
               let sql10 = `SELECT * FROM ME WHERE date ="` + date + `";`
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
                 let sql2 = `SELECT * FROM ME WHERE id > ` + week + ' && id <= '+day+';'
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
                         let sql3 = `SELECT * FROM ME WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                               let sql4 = `SELECT * FROM ME WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                                 req.session.londonTempDataForSearchME = {
                                 // city: 'Florida',
                                 // unit: 'celsius',
                                   dataPoints: dataForNitrateForSearch
                                 }
                               //
                                 req.session.salineForSearchLevelDataForGraphME = {
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

                                 req.session.theTempDataForGraphForSearchME = {
                                 // city: 'Florida',
                                 // unit: 'celsius',
                                   dataPoints: dataFortheTempForSearch
                                 }

                                 console.log(req.session.salineForSearchLevelDataForGraphME);



                                // for Nitrate
                                req.session.resetCodeForNitrateForSearchME = ''
                               app.get('/getTemperatureForSearchME'+req.session.resetCodeForNitrateForSearchME, function(req,res){
                                 res.send(req.session.londonTempDataForSearchME);
                               });
                                 app.get('/addTemperatureForSearchME', function(req,res){
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
                                 req.session.resetCodeForSalineForSearchME = ''
                                 app.get('/getSalineForSearchME'+req.session.resetCodeForSalineForSearchME, function(req,res){
                                   res.send(req.session.salineForSearchLevelDataForGraphME);
                                 });
                                 app.get('/addSalineForSearchME', function(req,res){
                                   var salineForSearch = parseInt(req.query.salineForSearch);
                                   var timeForSearch = parseInt(req.query.timeForSearch);
                                   if(salineForSearch && timeForSearch && !isNaN(salineForSearch) && !isNaN(timeForSearch)){
                                     var newDataPoint = {
                                       saline: salineForSearch,
                                       time: timeForSearch
                                     };
                                     req.session.salineForSearchLevelDataForGraphME.dataPoints.push(newDataPoint);
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
                                 req.session.resetCodeFortheTempForSearchME = ''
                                 app.get('/gettheTempForSearchME'+req.session.resetCodeFortheTempForSearchME, function(req,res){
                                   res.send(req.session.theTempDataForGraphForSearchME);
                                 });
                                 app.get('/addtheTempForSearchME', function(req,res){
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

                               if (chanceOfAnAlgaeBloom) {
                                 reasonForBloom("ME", day, req)
                               } else {
                                 req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                               }

                               setTimeout( function() {
                                 var reasonAndMethod = req.session.reasonAndMethod
                                 console.log(reasonAndMethod);
                                 res.render('index4ME', {reasonAndMethod:reasonAndMethod, alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})
                               }, 1200)



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
  app.get('/resetSearchME', function(req, res,) {
                 req.session.resetCodeForSalineForSearchME = "reset"
                 req.session.resetCodeForNitrateForSearchME = "reset"
                 req.session.resetCodeFortheTempForSearchME = "reset"

                 app.get('/getSalineForSearchME'+req.session.resetCodeForSalineForSearchME, function(req,res){
                   res.send(req.session.salineForSearchLevelDataForGraphME);
                 });
                app.get('/getTemperatureForSearchME'+req.session.resetCodeForNitrateForSearchME, function(req,res){
                  res.send(req.session.londonTempDataForSearchME);
                });
                app.get('/gettheTempForSearchME'+req.session.resetCodeFortheTempForSearchFP, function(req,res){
                  res.send(req.session.londonTempDataForSearchME);
                });
                 res.redirect('/')
        })
  app.get('/MEdata', function (req, res) {
                let sql = 'SELECT COUNT(*) FROM ME'
                db.query (sql, (err, result)=>{
                  var day = result[0]["COUNT(*)"]
                  var week = day - 7
                  let sql2 = `SELECT * FROM ME WHERE id > ` + week + ';'
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
                        let sql3 = `SELECT * FROM ME WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                              let sql4 = `SELECT * FROM ME WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                                app.get('/getTemperatureME', function(req,res){ //styppsxd
                                res.send(londonTempData);
                              });
                                app.get('/addTemperatureME', function(req,res){
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
                                app.get('/getSalineME', function(req,res){
                                  res.send(salineLevelDataForGraph);
                                });
                                app.get('/addSalineME', function(req,res){
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
                                app.get('/gettheTempME', function(req,res){
                                  res.send(theTempDataForGraph);
                                });
                                app.get('/addtheTempME', function(req,res){
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

                                let sql10 = `SELECT * FROM ME WHERE id ="` + day + `";`
                                console.log(sql10);
                                db.query(sql10, (err, result)=>{
                                  var conditions = result[0]



                                  if (chanceOfAnAlgaeBloom) {
                                    reasonForBloom("ME", day, req)
                                  } else {
                                    req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                                  }



                                  setTimeout( function() {
                                    var reasonAndMethod = req.session.reasonAndMethod
                                    console.log(reasonAndMethod);
                                    res.render('MEdata', {reasonAndMethod: reasonAndMethod, conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})
                                  }, 1200)



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

// JB
  app.get('/createJB', function(req,res) {
      let createJB = `CREATE TABLE JB (id int AUTO_INCREMENT, date VARCHAR(255), nitrateLevel FLOAT, salineLevel FLOAT, tempLevel FLOAT, PRIMARY KEY (id));`
      db.query(createJB, (err, result)=>{
        console.log(result);
      })
      //
      let sql5 = `CREATE TABLE JBnumberPoint (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql5, (err,result)=>{
        console.log(result);
      })
      //
      let sql6 = `CREATE TABLE JBnumberPointSaline (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql6, (err,result)=>{
        console.log(result);
      })
      //
      let sql8 = `CREATE TABLE JBnumberPointTemp (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql8, (err,result)=>{
        console.log(result);
      })
      res.render('home')

    })
  app.get('/deleteJB', function(req,res){
      let JBsql = `DROP TABLE JB;`
      db.query(JBsql, (err,result)=> {
      })
      let JBnumberPointSQL = `DROP TABLE JBnumberPoint;`
      db.query(JBnumberPointSQL, (err,result)=>{
      })
      let JBsalineSQL = `DROP TABLE JBnumberPointSaline;`
      db.query(JBsalineSQL, (err,result)=>{
      })
      let JBtempSQL = `DROP Table JBnumberPointTemp;`
      db.query(JBtempSQL, (err, result)=>{
      })
      res.render('home')
    });
  app.get('/JB', function(req, res) {


     var JBNitrate = XLSX.readFile('IRL-JB-Nitrate.xlsx');
     const sheet_name_list = JBNitrate.sheetNames;
     var hello = JBNitrate.Sheets.Sheet1
     var allValues = []
     for(var sequence in hello) {
       allValues.push(JBNitrate.Sheets.Sheet1[sequence].w)
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
         let sql = `INSERT INTO JBnumberPoint (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
     function getTheAverageJB(uniqueValueDates, theArray) {
       req.session.hello = 2+3
       for (var i = 0; i < uniqueValueDates.length ; i++) {
         req.session.dates = uniqueValueDates;
         let sql2 = 'SELECT AVG(level) AS averageLevel FROM JBnumberPoint WHERE date = "' + uniqueValueDates[i] +'";'
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
                  let sql3 = `INSERT INTO JB (date) VALUES (`+dateString+`);`
                  db.query (sql3, (err, result)=> {
                  })
                  if (z+1 == dates.length) {
                    for (var q = 0; q < array.length; q++) {
                      // console.log("q = "+ q);
                      var theLevel = array[q];
                      var idMatch = q+1;
                      // console.log(idMatch);
                      let sql4 = `UPDATE JB SET nitrateLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
     getTheAverageJB(uniqueValueDates, array)
     res.render('nitrateAnalyzedJB')
     })
  app.get('/salineJB', function(req, res) {
          var JBSaline = XLSX.readFile('IRL-JB-Saline.xlsx');
          const sheet_name_list = JBSaline.sheetNames;


          var hello = JBSaline.Sheets.Sheet1
          var allValues = []
          for(var sequence in hello) {
            allValues.push(JBSaline.Sheets.Sheet1[sequence].w)

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
              let sql = `INSERT INTO JBnumberPointSaline (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
          function getTheAverageJB(uniqueValueDates, theArray) {
            req.session.hello = 2+3
            for (var i = 0; i < uniqueValueDates.length ; i++) {
              req.session.dates = uniqueValueDates;
              let sql2 = 'SELECT AVG(level) AS averageLevel FROM JBnumberPointSaline WHERE date = "' + uniqueValueDates[i] +'";'
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
                           let sql4 = `UPDATE JB SET salineLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
          getTheAverageJB(uniqueValueDates, array)
          res.render('salineAnalyzedJB')
          })
  app.get('/JBSearch', function(req, res) {
                      var JBTemp = XLSX.readFile('IRL-JB-Temp.xlsx');
                      const sheet_name_list = JBTemp.sheetNames;


                      var hello = JBTemp.Sheets.Sheet1
                      var allValues = []
                      for(var sequence in hello) {
                        allValues.push(JBTemp.Sheets.Sheet1[sequence].w)

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
                          let sql = `INSERT INTO JBnumberPointTemp (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
                      function getTheAverageJB(uniqueValueDates, theArray) {
                        req.session.hello = 2+3
                        for (var i = 0; i < uniqueValueDates.length ; i++) {
                          req.session.dates = uniqueValueDates;
                          let sql2 = 'SELECT AVG(level) AS averageLevel FROM JBnumberPointTemp WHERE date = "' + uniqueValueDates[i] +'";'
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
                                       let sql4 = `UPDATE JB SET tempLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
                      getTheAverageJB(uniqueValueDates, array)
                      res.render('tempAnalyzedJB')
                      })
  app.get('/searchForSiteJB', function(req, res){
      res.render('searchForSiteJB')
    })
  app.post('/dateJB', function(req, res){
                 let date = req.body.date;
                 console.log(date);
                 let sql10 = `SELECT * FROM JB WHERE date ="` + date + `";`
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
                   let sql2 = `SELECT * FROM JB WHERE id > ` + week + ' && id <= '+day+';'
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
                           let sql3 = `SELECT * FROM JB WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                                 let sql4 = `SELECT * FROM JB WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                                   req.session.londonTempDataForSearchJB = {
                                   // city: 'Florida',
                                   // unit: 'celsius',
                                     dataPoints: dataForNitrateForSearch
                                   }
                                 //
                                   req.session.salineForSearchLevelDataForGraphJB = {
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

                                   req.session.theTempDataForGraphForSearchJB = {
                                   // city: 'Florida',
                                   // unit: 'celsius',
                                     dataPoints: dataFortheTempForSearch
                                   }

                                   console.log(req.session.salineForSearchLevelDataForGraphJB);



                                  // for Nitrate
                                  req.session.resetCodeForNitrateForSearchJB = ''
                                 app.get('/getTemperatureForSearchJB'+req.session.resetCodeForNitrateForSearchJB, function(req,res){
                                   res.send(req.session.londonTempDataForSearchJB);
                                 });
                                   app.get('/addTemperatureForSearchJB', function(req,res){
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
                                   req.session.resetCodeForSalineForSearchJB = ''
                                   app.get('/getSalineForSearchJB'+req.session.resetCodeForSalineForSearchJB, function(req,res){
                                     res.send(req.session.salineForSearchLevelDataForGraphJB);
                                   });
                                   app.get('/addSalineForSearchJB', function(req,res){
                                     var salineForSearch = parseInt(req.query.salineForSearch);
                                     var timeForSearch = parseInt(req.query.timeForSearch);
                                     if(salineForSearch && timeForSearch && !isNaN(salineForSearch) && !isNaN(timeForSearch)){
                                       var newDataPoint = {
                                         saline: salineForSearch,
                                         time: timeForSearch
                                       };
                                       req.session.salineForSearchLevelDataForGraphJB.dataPoints.push(newDataPoint);
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
                                   req.session.resetCodeFortheTempForSearchJB = ''
                                   app.get('/gettheTempForSearchJB'+req.session.resetCodeFortheTempForSearchJB, function(req,res){
                                     res.send(req.session.theTempDataForGraphForSearchJB);
                                   });
                                   app.get('/addtheTempForSearchJB', function(req,res){
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

                                 if (chanceOfAnAlgaeBloom) {

                                   reasonForBloom("JB", day, req)
                                 } else {
                                   req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                                 }



                                 setTimeout( function() {
                                   var reasonAndMethod = req.session.reasonAndMethod
                                   console.log(reasonAndMethod);
                                   res.render('index4JB', {reasonAndMethod:reasonAndMethod, alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})
                                 }, 1200)



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
  app.get('/resetSearchJB', function(req, res,) {
                   req.session.resetCodeForSalineForSearchJB = "reset"
                   req.session.resetCodeForNitrateForSearchJB = "reset"
                   req.session.resetCodeFortheTempForSearchJB = "reset"

                   app.get('/getSalineForSearchJB'+req.session.resetCodeForSalineForSearchJB, function(req,res){
                     res.send(req.session.salineForSearchLevelDataForGraphJB);
                   });
                  app.get('/getTemperatureForSearchJB'+req.session.resetCodeForNitrateForSearchJB, function(req,res){
                    res.send(req.session.londonTempDataForSearchJB);
                  });
                  app.get('/gettheTempForSearchJB'+req.session.resetCodeFortheTempForSearchFP, function(req,res){
                    res.send(req.session.londonTempDataForSearchJB);
                  });
                   res.redirect('/')
          })
  app.get('/JBdata', function (req, res) {
                        let sql = 'SELECT COUNT(*) FROM JB'
                        db.query (sql, (err, result)=>{
                          var day = result[0]["COUNT(*)"]
                          var week = day - 7
                          let sql2 = `SELECT * FROM JB WHERE id > ` + week + ';'
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
                                let sql3 = `SELECT * FROM JB WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                                      let sql4 = `SELECT * FROM JB WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                                        app.get('/getTemperatureJB', function(req,res){ //styppsxd
                                        res.send(londonTempData);
                                      });
                                        app.get('/addTemperatureJB', function(req,res){
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
                                        app.get('/getSalineJB', function(req,res){
                                          res.send(salineLevelDataForGraph);
                                        });
                                        app.get('/addSalineJB', function(req,res){
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
                                        app.get('/gettheTempJB', function(req,res){
                                          res.send(theTempDataForGraph);
                                        });
                                        app.get('/addtheTempJB', function(req,res){
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

                                        let sql10 = `SELECT * FROM JB WHERE id ="` + day + `";`
                                        console.log(sql10);
                                        db.query(sql10, (err, result)=>{
                                          var conditions = result[0]



                                          if (chanceOfAnAlgaeBloom) {

                                            reasonForBloom("JB", day, req)
                                          } else {
                                            req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                                          }








                                          setTimeout(function () {
                                            var reasonAndMethod = req.session.reasonAndMethod
                                            console.log(reasonAndMethod);
                                            res.render('JBdata', {reasonAndMethod:reasonAndMethod, conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})
                                          }, 1200)

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


//SF2

  app.get('/createSF2', function(req,res) {
      let createSF2 = `CREATE TABLE SF2 (id int AUTO_INCREMENT, date VARCHAR(255), nitrateLevel FLOAT, salineLevel FLOAT, tempLevel FLOAT, PRIMARY KEY (id));`
      db.query(createSF2, (err, result)=>{
        console.log(result);
      })
      //
      let sql5 = `CREATE TABLE SF2numberPoint (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql5, (err,result)=>{
        console.log(result);
      })
      //
      let sql6 = `CREATE TABLE SF2numberPointSaline (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql6, (err,result)=>{
        console.log(result);
      })
      //
      let sql8 = `CREATE TABLE SF2numberPointTemp (id int AUTO_INCREMENT, date VARCHAR (255), level VARCHAR (255), PRIMARY KEY (id));`
      db.query(sql8, (err,result)=>{
        console.log(result);
      })
      res.render('home')

    })
  app.get('/deleteSF2', function(req,res){
      let SF2sql = `DROP TABLE SF2;`
      db.query(SF2sql, (err,result)=> {
      })
      let SF2numberPointSQL = `DROP TABLE SF2numberPoint;`
      db.query(SF2numberPointSQL, (err,result)=>{
      })
      let SF2salineSQL = `DROP TABLE SF2numberPointSaline;`
      db.query(SF2salineSQL, (err,result)=>{
      })
      let SF2tempSQL = `DROP Table SF2numberPointTemp;`
      db.query(SF2tempSQL, (err, result)=>{
      })
      res.render('home')
    });
  app.get('/SF2', function(req, res) {


     var SF2Nitrate = XLSX.readFile('SLE-SF2-Nitrate.xlsx');
     const sheet_name_list = SF2Nitrate.sheetNames;
     var hello = SF2Nitrate.Sheets.Sheet1
     var allValues = []
     for(var sequence in hello) {
       allValues.push(SF2Nitrate.Sheets.Sheet1[sequence].w)
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
         let sql = `INSERT INTO SF2numberPoint (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
     function getTheAverageSF2(uniqueValueDates, theArray) {
       req.session.hello = 2+3
       for (var i = 0; i < uniqueValueDates.length ; i++) {
         req.session.dates = uniqueValueDates;
         let sql2 = 'SELECT AVG(level) AS averageLevel FROM SF2numberPoint WHERE date = "' + uniqueValueDates[i] +'";'
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
                  let sql3 = `INSERT INTO SF2 (date) VALUES (`+dateString+`);`
                  db.query (sql3, (err, result)=> {
                  })
                  if (z+1 == dates.length) {
                    for (var q = 0; q < array.length; q++) {
                      // console.log("q = "+ q);
                      var theLevel = array[q];
                      var idMatch = q+1;
                      // console.log(idMatch);
                      let sql4 = `UPDATE SF2 SET nitrateLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
     getTheAverageSF2(uniqueValueDates, array)
     res.render('nitrateAnalyzedSF2')
     })
  app.get('/salineSF2', function(req, res) {
             var SF2Saline = XLSX.readFile('SLE-SF2-Saline.xlsx');
             const sheet_name_list = SF2Saline.sheetNames;


             var hello = SF2Saline.Sheets.Sheet1
             var allValues = []
             for(var sequence in hello) {
               allValues.push(SF2Saline.Sheets.Sheet1[sequence].w)

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
                 let sql = `INSERT INTO SF2numberPointSaline (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
             function getTheAverageSF2(uniqueValueDates, theArray) {
               req.session.hello = 2+3
               for (var i = 0; i < uniqueValueDates.length ; i++) {
                 req.session.dates = uniqueValueDates;
                 let sql2 = 'SELECT AVG(level) AS averageLevel FROM SF2numberPointSaline WHERE date = "' + uniqueValueDates[i] +'";'
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
                              let sql4 = `UPDATE SF2 SET salineLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
             getTheAverageSF2(uniqueValueDates, array)
             res.render('salineAnalyzedSF2')
             })
  app.get('/SF2Search', function(req, res) {
                                 var SF2Temp = XLSX.readFile('SLE-SF2-Temp.xlsx');
                                 const sheet_name_list = SF2Temp.sheetNames;


                                 var hello = SF2Temp.Sheets.Sheet1
                                 var allValues = []
                                 for(var sequence in hello) {
                                   allValues.push(SF2Temp.Sheets.Sheet1[sequence].w)

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
                                     let sql = `INSERT INTO SF2numberPointTemp (date, level) VALUES (`+ theVariable + `, `+ allValues[i+2]+`);`
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
                                 function getTheAverageSF2(uniqueValueDates, theArray) {
                                   req.session.hello = 2+3
                                   for (var i = 0; i < uniqueValueDates.length ; i++) {
                                     req.session.dates = uniqueValueDates;
                                     let sql2 = 'SELECT AVG(level) AS averageLevel FROM SF2numberPointTemp WHERE date = "' + uniqueValueDates[i] +'";'
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
                                                  let sql4 = `UPDATE SF2 SET tempLevel = `+theLevel+` WHERE id = `+idMatch+`;`;
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
                                 getTheAverageSF2(uniqueValueDates, array)
                                 res.render('tempAnalyzedSF2')
                                 })
  app.get('/searchForSiteSF2', function(req, res){
                 res.render('searchForSiteSF2')
               })
  app.post('/dateSF2', function(req, res){
                let date = req.body.date;
                console.log(date);
                let sql10 = `SELECT * FROM SF2 WHERE date ="` + date + `";`
                db.query (sql10, (err, result)=>{
                  console.log(result);
                  var specificID = result[0].id;
                  var specificDayNitrate = result[0].nitrateLevel;
                  var specificDayDate = result[0].date;
                  var specificDaySaline = result[0].salineLevel;
                  var specificDayTemp = result[0].tempLevel;

                  // db.query (sql, (err, result)=>{
                  var day = result[0].id
                  console.log(day);
                  var week = day - 7
                  let sql2 = `SELECT * FROM SF2 WHERE id > ` + week + ' && id <= '+day+';'
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
                          let sql3 = `SELECT * FROM SF2 WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                                let sql4 = `SELECT * FROM SF2 WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                                  req.session.londonTempDataForSearchSF2 = {
                                  // city: 'Florida',
                                  // unit: 'celsius',
                                    dataPoints: dataForNitrateForSearch
                                  }
                                //
                                  req.session.salineForSearchLevelDataForGraphSF2 = {
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

                                  req.session.theTempDataForGraphForSearchSF2 = {
                                  // city: 'Florida',
                                  // unit: 'celsius',
                                    dataPoints: dataFortheTempForSearch
                                  }

                                  console.log(req.session.salineForSearchLevelDataForGraphSF2);



                                 // for Nitrate
                                 req.session.resetCodeForNitrateForSearchSF2 = ''
                                app.get('/getTemperatureForSearchSF2'+req.session.resetCodeForNitrateForSearchSF2, function(req,res){
                                  res.send(req.session.londonTempDataForSearchSF2);
                                });
                                  app.get('/addTemperatureForSearchSF2', function(req,res){
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
                                  req.session.resetCodeForSalineForSearchSF2 = ''
                                  app.get('/getSalineForSearchSF2'+req.session.resetCodeForSalineForSearchSF2, function(req,res){
                                    res.send(req.session.salineForSearchLevelDataForGraphSF2);
                                  });
                                  app.get('/addSalineForSearchSF2', function(req,res){
                                    var salineForSearch = parseInt(req.query.salineForSearch);
                                    var timeForSearch = parseInt(req.query.timeForSearch);
                                    if(salineForSearch && timeForSearch && !isNaN(salineForSearch) && !isNaN(timeForSearch)){
                                      var newDataPoint = {
                                        saline: salineForSearch,
                                        time: timeForSearch
                                      };
                                      req.session.salineForSearchLevelDataForGraphSF2.dataPoints.push(newDataPoint);
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
                                  req.session.resetCodeFortheTempForSearchSF2 = ''
                                  app.get('/gettheTempForSearchSF2'+req.session.resetCodeFortheTempForSearchSF2, function(req,res){
                                    res.send(req.session.theTempDataForGraphForSearchSF2);
                                  });
                                  app.get('/addtheTempForSearchSF2', function(req,res){
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

                                if (chanceOfAnAlgaeBloom) {

                                  reasonForBloom("SF2", day, req)
                                } else {
                                  req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                                }

                                setTimeout(function () {
                                  var reasonAndMethod = req.session.reasonAndMethod;
                                  console.log(reasonAndMethod);
                                  res.render('index4SF2', {reasonAndMethod: reasonAndMethod, alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})
                                }, 1200)
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
  app.get('/resetSearchSF2', function(req, res,) {
                  req.session.resetCodeForSalineForSearchSF2 = "reset"
                  req.session.resetCodeForNitrateForSearchSF2 = "reset"
                  req.session.resetCodeFortheTempForSearchSF2 = "reset"

                  app.get('/getSalineForSearchSF2'+req.session.resetCodeForSalineForSearchSF2, function(req,res){
                    res.send(req.session.salineForSearchLevelDataForGraphSF2);
                  });
                 app.get('/getTemperatureForSearchSF2'+req.session.resetCodeForNitrateForSearchSF2, function(req,res){
                   res.send(req.session.londonTempDataForSearchSF2);
                 });
                 app.get('/gettheTempForSearchSF2'+req.session.resetCodeFortheTempForSearchFP, function(req,res){
                   res.send(req.session.londonTempDataForSearchSF2);
                 });
                  res.redirect('/')
         })
  app.get('/SF2data', function (req, res) {
                               let sql = 'SELECT COUNT(*) FROM SF2'
                               db.query (sql, (err, result)=>{
                                 var day = result[0]["COUNT(*)"]
                                 var week = day - 7
                                 let sql2 = `SELECT * FROM SF2 WHERE id > ` + week + ';'
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
                                       let sql3 = `SELECT * FROM SF2 WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                                             let sql4 = `SELECT * FROM SF2 WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                                               app.get('/getTemperatureSF2', function(req,res){ //styppsxd
                                               res.send(londonTempData);
                                             });
                                               app.get('/addTemperatureSF2', function(req,res){
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
                                               app.get('/getSalineSF2', function(req,res){
                                                 res.send(salineLevelDataForGraph);
                                               });
                                               app.get('/addSalineSF2', function(req,res){
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
                                               app.get('/gettheTempSF2', function(req,res){
                                                 res.send(theTempDataForGraph);
                                               });
                                               app.get('/addtheTempSF2', function(req,res){
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

                                               let sql10 = `SELECT * FROM SF2 WHERE id ="` + day + `";`
                                               console.log(sql10);
                                               db.query(sql10, (err, result)=>{
                                                 var conditions = result[0]

                                                 if (chanceOfAnAlgaeBloom) {

                                                   reasonForBloom("SF2", day, req)
                                                 } else {
                                                   req.session.reasonAndMethod = {reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"}
                                                 }



                                                 setTimeout( function() {
                                                   var reasonAndMethod = req.session.reasonAndMethod
                                                   console.log(reasonAndMethod);
                                                   res.render('SF2data', {reasonAndMethod:reasonAndMethod, conditions:conditions, alert:alert, monthData:monthData, StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom})
                                                 }, 1200)
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

// END Indiv Sites

 function reasonForBloom(site, date, req) {
  var threeWeek = date - 21;
  let sql = `SELECT * FROM ` +site+` where id <= `+date+ ` AND id >= `+threeWeek+`;`
  db.query(sql, (err, result)=>{
    var firstWeekNitrateLevels = []
    var secondWeekNitrateLevels = []
    var firstWeekSalineLevels = []
    var secondWeekSalineLevels = []
    for (var i = 21; i > 14; i--) {
      firstWeekNitrateLevels.push(result[i].nitrateLevel)
      secondWeekNitrateLevels.push(result[i-7].nitrateLevel)
      firstWeekSalineLevels.push(result[i].salineLevel)
      secondWeekSalineLevels.push(result[i-7].nitrateLevel)
    }



    var firstWeekNitrateLevelsTotal = 0;
    for(var i = 0; i < firstWeekNitrateLevels.length; i++) {
        firstWeekNitrateLevelsTotal += firstWeekNitrateLevels[i];
    }
    var firstWeekNitrateLevelsAvg = firstWeekNitrateLevelsTotal / firstWeekNitrateLevels.length;


    var secondWeekNitrateLevelsTotal = 0;
    for(var i = 0; i < secondWeekNitrateLevels.length; i++) {
        secondWeekNitrateLevelsTotal += secondWeekNitrateLevels[i];
    }
    var secondWeekNitrateLevelsAvg = secondWeekNitrateLevelsTotal / secondWeekNitrateLevels.length;

    var firstWeekSalineLevelsTotal = 0;
    for(var i = 0; i < firstWeekSalineLevels.length; i++) {
        firstWeekSalineLevelsTotal += firstWeekSalineLevels[i];
    }
    var firstWeekSalineLevelsAvg = firstWeekSalineLevelsTotal / firstWeekSalineLevels.length;

    var secondWeekSalineLevelsTotal = 0;
    for(var i = 0; i < secondWeekSalineLevels.length; i++) {
        secondWeekSalineLevelsTotal += secondWeekSalineLevels[i];
    }
    var secondWeekSalineLevelsAvg = secondWeekSalineLevelsTotal / secondWeekSalineLevels.length;


    var reasonForAlgaeBloom = ""
    var protectionMethod = ""
    if (firstWeekNitrateLevelsAvg >= 12 &&  firstWeekSalineLevelsAvg >= 1.2) {
      reasonForAlgaeBloom = "Fertilizer Run-Off And Population Density"
      protectionMethod = "Limit Fertilizer Use In Households Neighboring Lagoon/Estuary"
    } else if (firstWeekNitrateLevelsAvg < 12 &&  firstWeekSalineLevelsAvg < 1.2) {
      reasonForAlgaeBloom = "Fresh Water (Presumably From Lake Okeechobee)"
      protectionMethod = "Salination of Water And No Discharges From Lake Okeechobee"
    }else if (firstWeekNitrateLevelsAvg >= 12 &&  firstWeekSalineLevelsAvg < 1.2) {
      reasonForAlgaeBloom = 'Fertilizer Run-Off / Population Density AND Fresh Water (Presumably From Lake Okeechobee)'
      protectionMethod = "Limit Fertilizer Use In Households Neighboring Lagoon/Estuary AND Salination of Water And No Discharges From Lake Okeechobee"
    } else {
      reasonForAlgaeBloom = "Unknown"
      protectionMethod = "Limit Nitrate and Fresh Water In Lagoon/Estuary"
    }

    var reasonAndMethod = {reasonForAlgaeBloom:reasonForAlgaeBloom, protectionMethod:protectionMethod}
    req.session.reasonAndMethod = reasonAndMethod



  })


 }


  function modifiedReasonForBloomOverlays(site, date, req) {
    console.log(date);
   var threeWeek = date - 21;
   let sql = `SELECT * FROM ` +site+` where id <= `+date+ ` AND id >= `+threeWeek+`;`
   db.query(sql, (err, result)=>{

     var firstWeekNitrateLevels = []
     var secondWeekNitrateLevels = []
     var firstWeekSalineLevels = []
     var secondWeekSalineLevels = []
     for (var i = 21; i > 14; i--) {
       firstWeekNitrateLevels.push(result[i].nitrateLevel)
       secondWeekNitrateLevels.push(result[i-7].nitrateLevel)
       firstWeekSalineLevels.push(result[i].salineLevel)
       secondWeekSalineLevels.push(result[i-7].nitrateLevel)
     }



     var firstWeekNitrateLevelsTotal = 0;
     for(var i = 0; i < firstWeekNitrateLevels.length; i++) {
         firstWeekNitrateLevelsTotal += firstWeekNitrateLevels[i];
     }
     var firstWeekNitrateLevelsAvg = firstWeekNitrateLevelsTotal / firstWeekNitrateLevels.length;


     var secondWeekNitrateLevelsTotal = 0;
     for(var i = 0; i < secondWeekNitrateLevels.length; i++) {
         secondWeekNitrateLevelsTotal += secondWeekNitrateLevels[i];
     }
     var secondWeekNitrateLevelsAvg = secondWeekNitrateLevelsTotal / secondWeekNitrateLevels.length;

     var firstWeekSalineLevelsTotal = 0;
     for(var i = 0; i < firstWeekSalineLevels.length; i++) {
         firstWeekSalineLevelsTotal += firstWeekSalineLevels[i];
     }
     var firstWeekSalineLevelsAvg = firstWeekSalineLevelsTotal / firstWeekSalineLevels.length;

     var secondWeekSalineLevelsTotal = 0;
     for(var i = 0; i < secondWeekSalineLevels.length; i++) {
         secondWeekSalineLevelsTotal += secondWeekSalineLevels[i];
     }
     var secondWeekSalineLevelsAvg = secondWeekSalineLevelsTotal / secondWeekSalineLevels.length;


     var reasonForAlgaeBloom = ""
     var protectionMethod = ""
     if (firstWeekNitrateLevelsAvg >= 12 &&  firstWeekSalineLevelsAvg >= 1.2) {
       reasonForAlgaeBloom = "Fertilizer Run-Off And Population Density"
       protectionMethod = "Limit Fertilizer Use In Households Neighboring Lagoon/Estuary"
     } else if (firstWeekNitrateLevelsAvg < 12 &&  firstWeekSalineLevelsAvg < 1.2) {
       reasonForAlgaeBloom = "Fresh Water (Presumably From Lake Okeechobee)"
       protectionMethod = "Salination of Water And No Discharges From Lake Okeechobee"
     }else if (firstWeekNitrateLevelsAvg >= 12 &&  firstWeekSalineLevelsAvg < 1.2) {
       reasonForAlgaeBloom = 'Fertilizer Run-Off / Population Density AND Fresh Water (Presumably From Lake Okeechobee)'
       protectionMethod = "Limit Fertilizer Use In Households Neighboring Lagoon/Estuary AND Salination of Water And No Discharges From Lake Okeechobee"
     } else {
       reasonForAlgaeBloom = "Unknown"
       protectionMethod = "Limit Nitrate and Fresh Water In Lagoon/Estuary"
     }

     var reasonAndMethod = {reasonForAlgaeBloom:reasonForAlgaeBloom, protectionMethod:protectionMethod}
     req.session.reasonAndMethodOverlays.push(reasonAndMethod)



   })


  }


  function modifiedReasonForBloomOverlaysSearch(site, date, req) {
   var threeWeek = date - 21;
   let sql = `SELECT * FROM ` +site+` where id <= `+date+ ` && id >= `+threeWeek+`;`
   db.query(sql, (err, result)=>{
     var firstWeekNitrateLevels = []
     var secondWeekNitrateLevels = []
     var firstWeekSalineLevels = []
     var secondWeekSalineLevels = []
     for (var i = 21; i > 14; i--) {
       firstWeekNitrateLevels.push(result[i].nitrateLevel)
       secondWeekNitrateLevels.push(result[i-7].nitrateLevel)
       firstWeekSalineLevels.push(result[i].salineLevel)
       secondWeekSalineLevels.push(result[i-7].nitrateLevel)
     }



     var firstWeekNitrateLevelsTotal = 0;
     for(var i = 0; i < firstWeekNitrateLevels.length; i++) {
         firstWeekNitrateLevelsTotal += firstWeekNitrateLevels[i];
     }
     var firstWeekNitrateLevelsAvg = firstWeekNitrateLevelsTotal / firstWeekNitrateLevels.length;


     var secondWeekNitrateLevelsTotal = 0;
     for(var i = 0; i < secondWeekNitrateLevels.length; i++) {
         secondWeekNitrateLevelsTotal += secondWeekNitrateLevels[i];
     }
     var secondWeekNitrateLevelsAvg = secondWeekNitrateLevelsTotal / secondWeekNitrateLevels.length;

     var firstWeekSalineLevelsTotal = 0;
     for(var i = 0; i < firstWeekSalineLevels.length; i++) {
         firstWeekSalineLevelsTotal += firstWeekSalineLevels[i];
     }
     var firstWeekSalineLevelsAvg = firstWeekSalineLevelsTotal / firstWeekSalineLevels.length;

     var secondWeekSalineLevelsTotal = 0;
     for(var i = 0; i < secondWeekSalineLevels.length; i++) {
         secondWeekSalineLevelsTotal += secondWeekSalineLevels[i];
     }
     var secondWeekSalineLevelsAvg = secondWeekSalineLevelsTotal / secondWeekSalineLevels.length;

     var overarchingCause = ""
     var reasonForAlgaeBloom = ""
     var protectionMethod = ""
     if (firstWeekNitrateLevelsAvg >= 12 &&  firstWeekSalineLevelsAvg >= 1.2) {
       overarchingCause = "Nitrate"
       reasonForAlgaeBloom = "Fertilizer Run-Off And Population Density"
       protectionMethod = "Limit Fertilizer Use In Households Neighboring Lagoon/Estuary"
     } else if (firstWeekNitrateLevelsAvg < 12 &&  firstWeekSalineLevelsAvg < 1.2) {
       overarchingCause = "Salinity"
       reasonForAlgaeBloom = "Fresh Water (Presumably From Lake Okeechobee)"
       protectionMethod = "Salination of Water And No Discharges From Lake Okeechobee"
     }else if (firstWeekNitrateLevelsAvg >= 12 &&  firstWeekSalineLevelsAvg < 1.2) {
       overarchingCause = "Nitrate and Salinity"
       reasonForAlgaeBloom = 'Fertilizer Run-Off / Population Density AND Fresh Water (Presumably From Lake Okeechobee)'
       protectionMethod = "Limit Fertilizer Use In Households Neighboring Lagoon/Estuary AND Salination of Water And No Discharges From Lake Okeechobee"
     } else {
       overarchingCause = "Unknown"
       reasonForAlgaeBloom = "Unknown"
       protectionMethod = "Limit Nitrate and Fresh Water In Lagoon/Estuary"
     }

     var reasonAndMethod = {cause:overarchingCause, reasonForAlgaeBloom:reasonForAlgaeBloom, protectionMethod:protectionMethod}
     req.session.reasonAndMethodOverlaysSearch.push(reasonAndMethod)



   })


  }

  function reasonForBloomiPhone(site, date, req) {
   var threeWeek = date - 21;
   let sql = `SELECT * FROM ` +site+` where id <= `+date+ ` AND id >= `+threeWeek+`;`
   db.query(sql, (err, result)=>{
     var firstWeekNitrateLevels = []
     var secondWeekNitrateLevels = []
     var firstWeekSalineLevels = []
     var secondWeekSalineLevels = []
     var firstWeekTempScore = []
     for (var i = 21; i > 14; i--) {
       firstWeekNitrateLevels.push(result[i].nitrateLevel)
       secondWeekNitrateLevels.push(result[i-7].nitrateLevel)
       firstWeekSalineLevels.push(result[i].salineLevel)
       secondWeekSalineLevels.push(result[i-7].nitrateLevel)
       firstWeekTempScore.push(result[i].tempLevel)
     }



     var firstWeekNitrateLevelsTotal = 0;
     for(var i = 0; i < firstWeekNitrateLevels.length; i++) {
         firstWeekNitrateLevelsTotal += firstWeekNitrateLevels[i];
     }
     var firstWeekNitrateLevelsAvg = firstWeekNitrateLevelsTotal / firstWeekNitrateLevels.length;


     var secondWeekNitrateLevelsTotal = 0;
     for(var i = 0; i < secondWeekNitrateLevels.length; i++) {
         secondWeekNitrateLevelsTotal += secondWeekNitrateLevels[i];
     }
     var secondWeekNitrateLevelsAvg = secondWeekNitrateLevelsTotal / secondWeekNitrateLevels.length;

     var firstWeekSalineLevelsTotal = 0;
     for(var i = 0; i < firstWeekSalineLevels.length; i++) {
         firstWeekSalineLevelsTotal += firstWeekSalineLevels[i];
     }
     var firstWeekSalineLevelsAvg = firstWeekSalineLevelsTotal / firstWeekSalineLevels.length;

     var secondWeekSalineLevelsTotal = 0;
     for(var i = 0; i < secondWeekSalineLevels.length; i++) {
         secondWeekSalineLevelsTotal += secondWeekSalineLevels[i];
     }
     var secondWeekSalineLevelsAvg = secondWeekSalineLevelsTotal / secondWeekSalineLevels.length;

     var firstWeekTempScoreTotal = 0;
     for(var i = 0; i < firstWeekNitrateLevels.length; i++) {
         firstWeekTempScoreTotal += firstWeekTempScore[i];
     }
     var firstWeekTempLevelAvg = firstWeekTempScoreTotal / firstWeekTempScore.length;


     var reasonForAlgaeBloom = ""
     var protectionMethod = ""
     if (firstWeekNitrateLevelsAvg >= 12 &&  firstWeekSalineLevelsAvg >= 1.2) {
       reasonForAlgaeBloom = "Nitrates/Fertilizer"
       protectionMethod = "Limit Fertilizer Use"
     } else if (firstWeekNitrateLevelsAvg < 12 &&  firstWeekSalineLevelsAvg < 1.2) {
       reasonForAlgaeBloom = "Fresh Water"
       protectionMethod = "No Discharges From Lake Okeechobee"
     }else if (firstWeekNitrateLevelsAvg >= 12 &&  firstWeekSalineLevelsAvg < 1.2) {
       reasonForAlgaeBloom = 'Nitrates and Fresh Water'
       protectionMethod = "Limit Fertilizer / No Discharges"
     } else {
       reasonForAlgaeBloom = "Unknown"
       protectionMethod = "Limit Nitrate and Fresh Water In Lagoon/Estuary"
     }

     var reasonAndMethod = {reasonForAlgaeBloom:reasonForAlgaeBloom, protectionMethod:protectionMethod}
     req.session.tempAverageiPhone.push(firstWeekTempLevelAvg)
     req.session.nitrateAverageiPhone.push(firstWeekNitrateLevelsAvg)
     req.session.salineAverageiPhone.push(firstWeekSalineLevelsAvg)
     req.session.reasonAndMethodiPhone.push(reasonAndMethod)



   })


  }


























// rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl

    app.get('/iPhoneData', function (req, res) {
      res.render('iPhoneData')
    })


    app.get('/download', function (req, res) {

        res.render('download')
  })

app.get('/overlays', function (req, res) {




    req.session.color = []
    req.session.possibleAlgaeBlooms = []
    function findColor (site) {
      let sql = 'SELECT COUNT(*) FROM '+site+';'
      db.query (sql, (err, result)=>{
        var day = result[0]["COUNT(*)"]
        req.session.overlayDay = day
        var week = day - 7
        let sql2 = `SELECT * FROM `+site+` WHERE id > ` + week + ';'
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
              let sql3 = `SELECT * FROM `+site+` WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                    let sql4 = `SELECT * FROM `+site+` WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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
                      if (chanceOfAnAlgaeBloom) {
                        StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                        req.session.color.push("red")
                        req.session.possibleAlgaeBlooms.push(site)
                      } else if (!chanceOfAnAlgaeBloom) {
                        StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                        req.session.color.push("green")
                      }

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

    }
  //=====================================================

    findColor("SB")
    findColor("VB")
    findColor("LP")
    findColor("FP")
    findColor("JB")
    findColor("SLE")
    findColor("NF")
    findColor("ME")
    findColor("SF")
    findColor("SF2")






    setTimeout( function(){
      console.log(req.session.color);
      console.log(req.session.possibleAlgaeBlooms);
      req.session.data = []
      function getData(site) {
        let sql20 = `SELECT COUNT(*) FROM `+site+`;`
        db.query(sql20, (err, result)=> {
          var day = result[0]["COUNT(*)"]
          let sql21 = `SELECT * FROM `+ site + ` WHERE id = `+ day + ';'
          db.query(sql21, (err, result)=>{
            req.session.data.push(result[0])
          })
        })
      }
      getData("SB")
      getData("VB")
      getData('LP')
      getData("FP")
      getData("JB")
      getData("SLE")
      getData("NF")
      getData("ME")
      getData("SF")
      getData("SF2")






      setTimeout(function(){
        var infoArray = {SBinfo: req.session.data[0], VBinfo: req.session.data[1], LPinfo: req.session.data[2], FPinfo:req.session.data[3], JBinfo:req.session.data[4], SLEinfo:req.session.data[5], NFinfo:req.session.data[6], MEinfo:req.session.data[7]}
          infoArray.SFinfo = req.session.data[8]
          infoArray.SF2info = req.session.data[9]
          var colors = {SBcolor:req.session.color[0], VBcolor:req.session.color[1], LPcolor: req.session.color[2], FPcolor:req.session.color[3], JBcolor:req.session.color[4], SLEcolor:req.session.color[5], NFcolor:req.session.color[6], MEcolor:req.session.color[7]}
          colors.SFcolor = req.session.color[8]
          colors.SF2color = req.session.color[9]
          var colorArray = []

          var SBToVBChunk1, SBToVBChunk2color, SBToVBChunk3color, SBToVBChunk4color, SBToVBChunk5color, SBToVBChunk6color, SBToVBChunk7color
          if (colors.SBcolor == "green" && colors.VBcolor == "green") {
            SBToVBChunk1 = SBToVBChunk2color = SBToVBChunk3color = SBToVBChunk4color = SBToVBChunk5color = SBToVBChunk6color = SBToVBChunk7color = "#08ff00"
            colorArray.push({SBToVB:{SBToVBChunk1:SBToVBChunk1, SBToVBChunk2color:SBToVBChunk2color, SBToVBChunk3color:SBToVBChunk3color, SBToVBChunk4color:SBToVBChunk4color, SBToVBChunk5color:SBToVBChunk5color, SBToVBChunk6color:SBToVBChunk6color, SBToVBChunk7color:SBToVBChunk7color}})
          } else if (colors.SBcolor == "red" && colors.VBcolor == "red") {
            SBToVBChunk1 = SBToVBChunk2color = SBToVBChunk3color = SBToVBChunk4color = SBToVBChunk5color = SBToVBChunk6color = SBToVBChunk7color = "red"
            colorArray.push({SBToVB:{SBToVBChunk1:SBToVBChunk1color, SBToVBChunk2color:SBToVBChunk2color, SBToVBChunk3color:SBToVBChunk3color, SBToVBChunk4color:SBToVBChunk4color, SBToVBChunk5color:SBToVBChunk5color, SBToVBChunk6color:SBToVBChunk6color, SBToVBChunk7color:SBToVBChunk7color}})

          } else {
            SBToVBChunk1 = SBToVBChunk2color = SBToVBChunk3color = SBToVBChunk4color = SBToVBChunk5color = SBToVBChunk6color = SBToVBChunk7color = "purple"
            colorArray.push({SBToVB:{SBToVBChunk1:SBToVBChunk1, SBToVBChunk2color:SBToVBChunk2color, SBToVBChunk3color:SBToVBChunk3color, SBToVBChunk4color:SBToVBChunk4color, SBToVBChunk5color:SBToVBChunk5color, SBToVBChunk6color:SBToVBChunk6color, SBToVBChunk7color:SBToVBChunk7color}})

          }

          var VBToLPcolor
          if (colors.VBcolor == "green" && colors.LPcolor == "green") {
            VBToLPcolor = '#08ff00'
            colorArray.push({VBToLP: {VBToLPcolor}})
          } else if (colors.VBcolor == "red" && colors.LPcolor == "red") {
            VBToLPcolor = "red"
            colorArray.push({VBToLP: {VBToLPcolor}})
          } else {
            VBToLPcolor = "purple"
            colorArray.push({VBToLP: {VBToLPcolor}})
          }

          var LPToFPcolor
          if (colors.LPcolor == "green" && colors.FPcolor == "green") {
            LPToFPcolor = '#08ff00'
            colorArray.push({LPToFP: {LPToFPcolor}})
          } else if (colors.LPcolor == "red" && colors.FPcolor == "red") {
              LPToFPcolor = "red"
              colorArray.push({LPToFP: {LPToFPcolor}})
          } else {
              LPToFPcolor = "purple"
              colorArray.push({LPToFP: {LPToFPcolor}})
          }

          var FPToJBcolor
          if (colors.JBcolor == "green" && colors.FPcolor == "green") {
            FPToJBcolor = '#08ff00'
            colorArray.push({FPToJB: {FPToJBcolor}})
          } else if (colors.JBcolor == "red" && colors.FPcolor == "red") {
              FPToJBcolor = "red"
              colorArray.push({FPToJB: {FPToJBcolor}})
          } else {
              FPToJBcolor = "purple"
              colorArray.push({FPToJB: {FPToJBcolor}})
          }

          var JBToSLEcolor
          if (colors.JBcolor == "green" && colors.SLEcolor == "green") {
            JBToSLEcolor = '#08ff00'
            colorArray.push({JBToSLE: {JBToSLEcolor}})
          } else if (colors.JBcolor == "red" && colors.SLEcolor == "red") {
              JBToSLEcolor = "red"
              colorArray.push({JBToSLE: {JBToSLEcolor}})
          } else {
              JBToSLEcolor = "purple"
              colorArray.push({JBToSLE: {JBToSLEcolor}})
          }

          var leftOfMEcolor
          if (colors.MEcolor == "green") {
            leftOfMEcolor = '#08ff00'
            colorArray.push({leftOfME: {leftOfMEcolor}})
          } else {
            leftOfMEcolor = 'red'
            colorArray.push({leftOfME: {leftOfMEcolor}})
          }

          var topOfNFcolor
          if (colors.MEcolor == "green") {
            topOfNFcolor = '#08ff00'
            colorArray.push({topOfNF: {topOfNFcolor}})
          } else {
            topOfNFcolor = 'red'
            colorArray.push({topOfNF: {topOfNFcolor}})
          }

          var aroundSFcolor
          if (colors.MEcolor == "green") {
            aroundSFcolor = '#08ff00'
            colorArray.push({aroundSF: {aroundSFcolor}})
          } else {
            aroundSFcolor = 'red'
            colorArray.push({aroundSF: {aroundSFcolor}})
          }


          var SFToNFcolor
          if (colors.SFcolor == "green" && colors.NFcolor == "green") {
            SFToNFcolor = '#08ff00'
            colorArray.push({SFToNF: {SFToNFcolor}})
          } else if (colors.SFcolor == "red" && colors.NFcolor == "red") {
              SFToNFcolor = "red"
              colorArray.push({SFToNF: {SFToNFcolor}})
          } else {
              SFToNFcolor = "purple"
              colorArray.push({SFToNF: {SFToNFcolor}})
          }

          var METoBordercolor
          if (colors.MEcolor == "green") {
            METoBordercolor = '#08ff00'
            colorArray.push({METoBorder: {METoBordercolor}})
          } else {
            METoBordercolor = 'red'
            colorArray.push({METoBorder: {METoBordercolor}})
          }

          var aroundSF2color
          if (colors.MEcolor == "green") {
            aroundSF2color = '#08ff00'
            colorArray.push({aroundSF2: {aroundSF2color}})
          } else {
            aroundSF2color = 'red'
            colorArray.push({aroundSF2: {aroundSF2color}})
          }



        console.log(colorArray);
        req.session.reasonAndMethodOverlays = []
        req.session.siteList = []
        function finalModifiedReasonForBloomOverlays(site, day, req) {
          req.session.siteList.push(site)
          if (req.session.possibleAlgaeBlooms.indexOf(site) > -1 ) {
            modifiedReasonForBloomOverlays(site, day, req)
          } else {
            req.session.reasonAndMethodOverlays.push({reasonForAlgaeBloom: "No Chance Of Algae Bloom", protectionMethod: "For General Estuary Health, Reduce Fertilizer Use"})

          }
        }


        finalModifiedReasonForBloomOverlays('SB', req.session.overlayDay, req)
        finalModifiedReasonForBloomOverlays('VB', req.session.overlayDay, req)
        finalModifiedReasonForBloomOverlays('LP', req.session.overlayDay, req)
        finalModifiedReasonForBloomOverlays('FP', req.session.overlayDay, req)
        finalModifiedReasonForBloomOverlays('JB', req.session.overlayDay, req)
        finalModifiedReasonForBloomOverlays('SLE', req.session.overlayDay, req)
        finalModifiedReasonForBloomOverlays('NF', req.session.overlayDay, req)
        finalModifiedReasonForBloomOverlays('ME', req.session.overlayDay, req)
        finalModifiedReasonForBloomOverlays('SF', req.session.overlayDay, req)
        finalModifiedReasonForBloomOverlays('SF2', req.session.overlayDay, req)



        setTimeout(function () {
          console.log("===============");
          console.log(req.session.siteList);



          res.render('overlays', {infoArray: infoArray, colorArray:colorArray, possibleBlooms:req.session.possibleAlgaeBlooms, reasonAndMethod:req.session.reasonAndMethodOverlays, siteList: req.session.siteList} )

          var numberOfSitesWithBlooms = req.session.possibleAlgaeBlooms.length

          // for (var i = 0; i < numberOfSitesWithBlooms.length; i++) {
          //
          //   const obj = { i: req.session.possibleAlgaeBlooms[i]}
          //
          //   jsonfile.writeFile(file, obj, function (err) {
          //     if (err) console.error(err)
          //   })
          // }



        },600)



      }, 500);
    }, 500 );



   })

app.get('/metaSearch', function (req, res) {
  res.render('metaSearch')
})

app.post('/searchWithOverlays', function(req, res) {
  req.session.possibleAlgaeBloomsForSearch = []
  req.session.colorForSearch = []
  function findColorSearch(site){
    let date = req.body.date;

    let sql10 = `SELECT * FROM `+site+` WHERE date ="` + date + `";`
    db.query (sql10, (err, result)=>{
      var specificDayNitrate = result[0].nitrateLevel;
      var specificDayDate = result[0].date;
      var specificDaySaline = result[0].salineLevel;
      var specificDayTemp = result[0].tempLevel;

      // db.query (sql, (err, result)=>{
      var day = result[0].id
      req.session.overlayDaySearch = day


      var week = day - 7
      let sql2 = `SELECT * FROM `+site+` WHERE id > ` + week + ' && id <= '+day+';'
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

              var oneWeekAgo = week - 7
              let sql3 = `SELECT * FROM `+site+` WHERE id > ` + oneWeekAgo + ' && id <='+week+';'
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
                    let sql4 = `SELECT * FROM `+site+` WHERE id > ` + twoWeeksAgo + ' && id <= '+oneWeekAgo+';'
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

                          var tempSlope = slopeMaker(monthData.firstWeekTempScore, monthData.secondWeekTempScore, monthData.thirdWeekTempScore)
                          var aChanceOfAnAlgaeBloom

                        var chanceOfAnAlgaeBloom = determineChanceOfAlgaeBloom(monthData, nitrateSalineSlope, tempSlope, aChanceOfAnAlgaeBloom)


                      var alert
                      var StringChanceOfAnAlgaeBloom
                      if (chanceOfAnAlgaeBloom) {
                        StringChanceOfAnAlgaeBloom = "There is a possible algae bloom soon"
                        alert = "alert-danger"
                        req.session.colorForSearch.push("red")
                        req.session.possibleAlgaeBloomsForSearch.push(site)
                      } else if (!chanceOfAnAlgaeBloom) {
                        StringChanceOfAnAlgaeBloom = "There is NOT a possible algae bloom soon"
                        alert = "alert-success"
                        req.session.colorForSearch.push("green")

                      }
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
  }


  findColorSearch("SB")
  findColorSearch("VB")
  findColorSearch("LP")
  findColorSearch("FP")
  findColorSearch("JB")
  findColorSearch("SLE")
  findColorSearch("NF")
  findColorSearch("ME")
  findColorSearch("SF")
  findColorSearch("SF2")


  setTimeout(function () {
    console.log(req.session.colorForSearch);

    req.session.dataForSearch = []
    function getData(site) {
      let date = req.body.date;
      let sql10 = `SELECT * FROM `+site+` WHERE date ="` + date + `";`
      db.query (sql10, (err, result)=>{
        var specificDayNitrate = result[0].nitrateLevel;
        var specificDayDate = result[0].date;
        var specificDaySaline = result[0].salineLevel;
        var specificDayTemp = result[0].tempLevel;
        req.session.dataForSearch.push({nitrateLevel: result[0].nitrateLevel, salineLevel:result[0].salineLevel, tempLevel: result[0].tempLevel })
      });
    }
    getData("SB")
    getData("VB")
    getData('LP')
    getData("FP")
    getData("JB")
    getData("SLE")
    getData("NF")
    getData("ME")
    getData("SF")
    getData("SF2")

    setTimeout(function () {

         var infoArray = {SBinfo: req.session.dataForSearch[0], VBinfo: req.session.dataForSearch[1], LPinfo: req.session.dataForSearch[2], FPinfo:req.session.dataForSearch[3], JBinfo:req.session.dataForSearch[4], SLEinfo:req.session.dataForSearch[5], NFinfo:req.session.dataForSearch[6], MEinfo:req.session.dataForSearch[7]}
          infoArray.SFinfo = req.session.dataForSearch[8]
          infoArray.SF2info = req.session.dataForSearch[9]
          var colors = {SBcolor:req.session.colorForSearch[0], VBcolor:req.session.colorForSearch[1], LPcolor: req.session.colorForSearch[2], FPcolor:req.session.colorForSearch[3], JBcolor:req.session.colorForSearch[4], SLEcolor:req.session.colorForSearch[5], NFcolor:req.session.colorForSearch[6], MEcolor:req.session.colorForSearch[7]}
          colors.SFcolor = req.session.colorForSearch[8]
          colors.SF2color = req.session.colorForSearch[9]
          var colorArray = []

          var SBToVBChunk1, SBToVBChunk2color, SBToVBChunk3color, SBToVBChunk4color, SBToVBChunk5color, SBToVBChunk6color, SBToVBChunk7color
          if (colors.SBcolor == "green" && colors.VBcolor == "green") {
            SBToVBChunk1 = SBToVBChunk2color = SBToVBChunk3color = SBToVBChunk4color = SBToVBChunk5color = SBToVBChunk6color = SBToVBChunk7color = "#08ff00"
            colorArray.push({SBToVB:{SBToVBChunk1:SBToVBChunk1, SBToVBChunk2color:SBToVBChunk2color, SBToVBChunk3color:SBToVBChunk3color, SBToVBChunk4color:SBToVBChunk4color, SBToVBChunk5color:SBToVBChunk5color, SBToVBChunk6color:SBToVBChunk6color, SBToVBChunk7color:SBToVBChunk7color}})
          } else if (colors.SBcolor == "red" && colors.VBcolor == "red") {
            SBToVBChunk1 = SBToVBChunk2color = SBToVBChunk3color = SBToVBChunk4color = SBToVBChunk5color = SBToVBChunk6color = SBToVBChunk7color = "red"
            colorArray.push({SBToVB:{SBToVBChunk1:SBToVBChunk1color, SBToVBChunk2color:SBToVBChunk2color, SBToVBChunk3color:SBToVBChunk3color, SBToVBChunk4color:SBToVBChunk4color, SBToVBChunk5color:SBToVBChunk5color, SBToVBChunk6color:SBToVBChunk6color, SBToVBChunk7color:SBToVBChunk7color}})

          } else {
            SBToVBChunk1 = SBToVBChunk2color = SBToVBChunk3color = SBToVBChunk4color = SBToVBChunk5color = SBToVBChunk6color = SBToVBChunk7color = "purple"
            colorArray.push({SBToVB:{SBToVBChunk1:SBToVBChunk1, SBToVBChunk2color:SBToVBChunk2color, SBToVBChunk3color:SBToVBChunk3color, SBToVBChunk4color:SBToVBChunk4color, SBToVBChunk5color:SBToVBChunk5color, SBToVBChunk6color:SBToVBChunk6color, SBToVBChunk7color:SBToVBChunk7color}})

          }

          var VBToLPcolor
          if (colors.VBcolor == "green" && colors.LPcolor == "green") {
            VBToLPcolor = '#08ff00'
            colorArray.push({VBToLP: {VBToLPcolor}})
          } else if (colors.VBcolor == "red" && colors.LPcolor == "red") {
            VBToLPcolor = "red"
            colorArray.push({VBToLP: {VBToLPcolor}})
          } else {
            VBToLPcolor = "purple"
            colorArray.push({VBToLP: {VBToLPcolor}})
          }

          var LPToFPcolor
          if (colors.LPcolor == "green" && colors.FPcolor == "green") {
            LPToFPcolor = '#08ff00'
            colorArray.push({LPToFP: {LPToFPcolor}})
          } else if (colors.LPcolor == "red" && colors.FPcolor == "red") {
              LPToFPcolor = "red"
              colorArray.push({LPToFP: {LPToFPcolor}})
          } else {
              LPToFPcolor = "purple"
              colorArray.push({LPToFP: {LPToFPcolor}})
          }

          var FPToJBcolor
          if (colors.JBcolor == "green" && colors.FPcolor == "green") {
            FPToJBcolor = '#08ff00'
            colorArray.push({FPToJB: {FPToJBcolor}})
          } else if (colors.JBcolor == "red" && colors.FPcolor == "red") {
              FPToJBcolor = "red"
              colorArray.push({FPToJB: {FPToJBcolor}})
          } else {
              FPToJBcolor = "purple"
              colorArray.push({FPToJB: {FPToJBcolor}})
          }

          var JBToSLEcolor
          if (colors.JBcolor == "green" && colors.SLEcolor == "green") {
            JBToSLEcolor = '#08ff00'
            colorArray.push({JBToSLE: {JBToSLEcolor}})
          } else if (colors.JBcolor == "red" && colors.SLEcolor == "red") {
              JBToSLEcolor = "red"
              colorArray.push({JBToSLE: {JBToSLEcolor}})
          } else {
              JBToSLEcolor = "purple"
              colorArray.push({JBToSLE: {JBToSLEcolor}})
          }

          var leftOfMEcolor
          if (colors.MEcolor == "green") {
            leftOfMEcolor = '#08ff00'
            colorArray.push({leftOfME: {leftOfMEcolor}})
          } else {
            leftOfMEcolor = 'red'
            colorArray.push({leftOfME: {leftOfMEcolor}})
          }

          var topOfNFcolor
          if (colors.NFcolor == "green") {
            topOfNFcolor = '#08ff00'
            colorArray.push({topOfNF: {topOfNFcolor}})
          } else {
            topOfNFcolor = 'red'
            colorArray.push({topOfNF: {topOfNFcolor}})
          }

          var aroundSFcolor
          if (colors.SFcolor == "green") {
            aroundSFcolor = '#08ff00'
            colorArray.push({aroundSF: {aroundSFcolor}})
          } else {
            aroundSFcolor = 'red'
            colorArray.push({aroundSF: {aroundSFcolor}})
          }


          var SFToNFcolor
          if (colors.SFcolor == "green" && colors.NFcolor == "green") {
            SFToNFcolor = '#08ff00'
            colorArray.push({SFToNF: {SFToNFcolor}})
          } else if (colors.SFcolor == "red" && colors.NFcolor == "red") {
              SFToNFcolor = "red"
              colorArray.push({SFToNF: {SFToNFcolor}})
          } else {
              SFToNFcolor = "purple"
              colorArray.push({SFToNF: {SFToNFcolor}})
          }

          var METoBordercolor
          if (colors.MEcolor == "green") {
            METoBordercolor = '#08ff00'
            colorArray.push({METoBorder: {METoBordercolor}})
          } else {
            METoBordercolor = 'red'
            colorArray.push({METoBorder: {METoBordercolor}})
          }

          var aroundSF2color
          if (colors.SF2color == "green") {
            aroundSF2color = '#08ff00'
            colorArray.push({aroundSF2: {aroundSF2color}})
          } else {
            aroundSF2color = 'red'
            colorArray.push({aroundSF2: {aroundSF2color}})
          }

          console.log("------------------");
          req.session.reasonAndMethodOverlaysSearch = []
          req.session.siteListSearch = []

          function finalModifiedReasonForBloomOverlaysSearch(site, day, req) {

            req.session.siteListSearch.push(site)

            if (req.session.possibleAlgaeBloomsForSearch.indexOf(site) > -1 ) {
              modifiedReasonForBloomOverlaysSearch(site, day, req)
            }
          }



          finalModifiedReasonForBloomOverlaysSearch('SB', req.session.overlayDaySearch, req)
          finalModifiedReasonForBloomOverlaysSearch('VB', req.session.overlayDaySearch, req)
          finalModifiedReasonForBloomOverlaysSearch('LP', req.session.overlayDaySearch, req)
          finalModifiedReasonForBloomOverlaysSearch('FP', req.session.overlayDaySearch, req)
          finalModifiedReasonForBloomOverlaysSearch('JB', req.session.overlayDaySearch, req)
          finalModifiedReasonForBloomOverlaysSearch('SLE', req.session.overlayDaySearch, req)
          finalModifiedReasonForBloomOverlaysSearch('NF', req.session.overlayDaySearch, req)
          finalModifiedReasonForBloomOverlaysSearch('ME', req.session.overlayDaySearch, req)
          finalModifiedReasonForBloomOverlaysSearch('SF', req.session.overlayDaySearch, req)
          finalModifiedReasonForBloomOverlaysSearch('SF2', req.session.overlayDaySearch, req)

      setTimeout(function () {
        console.log(req.session.reasonAndMethodOverlaysSearch);

        console.log("===============");
        res.render('searchWithOverlays', {infoArray: infoArray, colorArray:colorArray, date: req.body.date, possibleBlooms: req.session.possibleAlgaeBloomsForSearch, reasonAndMethod:req.session.reasonAndMethodOverlaysSearch, siteList: req.session.siteListSearch} )
      },600)





    }, 500)
  }, 1000)
})



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
