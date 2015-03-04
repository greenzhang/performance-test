//定义只读变量
const TIMES = parseInt(process.env.TIMES || 1), //测试次数
    LIMIT = parseInt(process.env.LIMIT || 1000); //写入数据库条数
var runSqlTest = require("./mysql"),
    runOrmTest = require("./node-orm");

var printDurations = function (lib, durations) {
    console.log()

    for (var testName in durations[0]) {
        var sum = 0
            , msg = "{{lib}}#{{testName}} ({{times}} runs): {{duration}}ms"

        durations.forEach(function (res) {
            sum += res[testName]
        })

        msg = msg
            .replace('{{lib}}', lib)
            .replace('{{testName}}', testName)
            .replace('{{times}}', durations.length)
            .replace('{{duration}}', sum / durations.length)

        console.log(msg)
    }
};
runSqlTest(TIMES, LIMIT, function (mysqlDurations) {
    runOrmTest(TIMES, LIMIT, function (ormDurations) {
        printDurations('mysql', mysqlDurations);
        printDurations('orm', ormDurations);
    })
});

