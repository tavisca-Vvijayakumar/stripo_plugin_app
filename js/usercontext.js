var usercontext = {};

var userContextConfiguration = {
    /*
    This method is use to load configuration from the content stack in stripo plugin app.
    * @param: userContextObect.
    */
    loadUserContext: async function (userContextObject) {
        usercontext = userContextObject;
        return "Ok";
    }
}

export {userContextConfiguration, usercontext }