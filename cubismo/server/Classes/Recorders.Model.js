/* globals Tools Log Application Model*/
Model.prototype.book = function(callback) {
    var self = this;

    const mainFunction = function(callback) {
        self.booked = true;
        self.save()
            .then(() => {
                return callback(null);
            })
            .catch((error) => {
                return callback(error);
            });
    };

    if (callback && typeof callback === "object") {
        return mainFunction(callback);
    }

    return new Promise(function(resolve, reject) {
        mainFunction(function(error, result) {
            error ? reject(error) : resolve(result);
        });
    });
}