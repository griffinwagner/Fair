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
