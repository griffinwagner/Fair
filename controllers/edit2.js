if (chanceOfAnAlgaeBloom) {
  reasonForBloom("SF2", day, req)
}

setTimeout(function () {
  var reasonAndMethod = req.session.reasonAndMethod
  res.render('index4SF2', {alert:alert, nitrate:specificDayNitrate, monthData:monthData,  StringChanceOfAnAlgaeBloom:StringChanceOfAnAlgaeBloom, saline:specificDaySaline, temp:specificDayTemp, date:specificDayDate})
}, 1200)
