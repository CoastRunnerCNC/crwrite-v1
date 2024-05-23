import _ from "underscore";

export default class APIUtility {

    static handleAsyncApiResponse(event, eventName, functionToCall) {
        let returnValue = null;
        if (_.isFunction(functionToCall)) {
            let args = Array.prototype.slice.call(arguments);
            if (args.length > 3) {
                returnValue = functionToCall.apply(null, args.slice(3));
            } else {
                returnValue = functionToCall.apply();
            }
        }

        event.sender.send(`${eventName}Response`, returnValue);
        event.returnValue = returnValue;
    }
}