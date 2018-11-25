function determineColor(site){

       let sql = 'SELECT COUNT(*) FROM '+ site + ';'
       db.query (sql, (err, result)=>{
         var day = result[0]["COUNT(*)"]
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
                           function (first, second, third) {
                             var addedFirstValues = second - first
                             var firstSlope = addedFirstValues / 2
                             var addedSecondValues = third - second
                             var secondSlope = addedSecondValues / 2
                             var finalAddedValues = firstSlope + secondSlope
                             var finalSlope = finalAddedValues / 2
                             return finalSlope
                           }


                           var addedFirstValues = monthData.secondWeekNitrateSalineScore - monthData.firstWeekNitrateSalineScore
                           var firstSlope = addedFirstValues / 2
                           var addedSecondValues = monthData.thirdWeekNitrateSalineScore - monthData.secondWeekNitrateSalineScore
                           var secondSlope = addedSecondValues / 2
                           var finalAddedValues = firstSlope + secondSlope
                           var nitrateSalineSlope = finalAddedValues / 2

                           var addedFirstValues2 = monthData.secondWeekTempScore - monthData.firstWeekTempScore
                           var firstSlope2 = addedFirstValues2 / 2
                           var addedSecondValues2 = monthData.thirdWeekNitrateSalineScore - monthData.secondWeekTempScore
                           var secondSlope2 = addedSecondValues2 / 2
                           var finalAddedValues2 = firstSlope2 + secondSlope2
                           var tempSlope = finalAddedValues2 / 2

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

                         return (alert)




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
