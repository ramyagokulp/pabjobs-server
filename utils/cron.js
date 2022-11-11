const moment = require('moment');
const cron = require('node-cron');
const Job = require('../db/Job');
const JobAlerts = require('../db/JobAlerts');
const JobApplicant = require('../db/JobApplicant');
const router = require("express").Router();
const Recruiter = require("../db/Recruiter");

cron.schedule('0 0 0 * * *', async () => {
  console.log('running a task every day');
  const today = moment().startOf('day')
//   console.log('ttt ',today);
  let jobs = await Job.find({
    dateOfPosting: {
        $gte: today.toDate(),
        $lte: moment(today).endOf('day').toDate()
      }
  })
  await Promise.all(
      jobs.map(async job => {
        let users = await JobApplicant.find({skills: {$in: job.skillsets} })
        // console.log('uuuu ',users);
        let jobAlertsList = users.map(user => {
            let jobAlert = {
                userId: user.userId,
                jobId: job._id
            }
            return jobAlert;
        })
        // console.log('jjjj ', jobAlertsList);
        JobAlerts.insertMany(jobAlertsList);
      })
  )
//   console.log('jobs', jobs);
});
//daily cron job
let dailyCronJob = () => {
  try {
    cron.schedule('0 0 * * *', async () => {
      let update = {
        "subscriptionDetails.$[].isDailySmsCount": 0,
        "subscriptionDetails.$[].isDailyProfileView": 0,
        "subscriptionDetails.$[].isDailyExcelDownloadCount": 0
      }
      await Recruiter.findOneAndUpdate({ subscriptionDetails: { $exists: true, $ne: null } }, update).
        then(() => {
          console.log('update data')
        }).catch((e) => {
          console.log(e, 'Not updated')
        })
    });
  } catch (error) {
    console.log(error)
  }

}
//Monthly cron ;
let MonthlyCronJob = () => {
  try {
    cron.schedule('0 0 * * *', async () => {
      // console.log(Date.now())
      let recuiterData = await Recruiter.find({ subscriptionDetails: { $exists: true, $ne: null } })
      recuiterData.forEach(async (data) => {
        let datee = Date.now()
        let date = new Date(datee).toISOString();
        let d = JSON.stringify(data.subscriptionDetails[0].isSubscriptionExpiryDate)
        let update;
        if (d.slice(1, 11) == date.slice(0, 10)) {
          update = {
            "subscriptionDetails.$[].isMonthlySmsCount": 0,
            "subscriptionDetails.$[].isMonthlyProfileView": 0,
            "subscriptionDetails.$[].isMonthlyExcelDownloadCount": 0,
          }
          await Recruiter.findOneAndUpdate({ _id: data._id }, update).
            then(() => {
              console.log('update data')
            }).catch((e) => {
              console.log(e, 'Not updated')
            })
        } else {
          console.log('Time not update at:::')
        }

      })


    });
  } catch (error) {
    console.log(error)
  }

}

dailyCronJob();
MonthlyCronJob();