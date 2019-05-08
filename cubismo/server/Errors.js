process.on('uncaughtException', function (err) {
  Log.error(`Uncaught exception:`, err);
});

process.on('unhandledRejection', function (err) {
  Log.error(`Unhandled rejection:`, err);
});