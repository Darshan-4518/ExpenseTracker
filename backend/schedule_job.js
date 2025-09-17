const schedule = require('node-schedule');

function makeScheduler(cronExpresion,taskFunction){
    schedule.scheduleJob(cronExpresion,taskFunction)
}

module.exports = {makeScheduler:makeScheduler}