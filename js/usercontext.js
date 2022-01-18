
var usercontext = {};
var userContextConfiguration = {
    /*
    This method is use to load configuration from the content stack in stripo plugin app.
    * @param: userContextObect.
    */
    loadUserContext: async function (userContextObject) {
        console.log(userContextObject)
        var bytes = CryptoJS.AES.decrypt(userContextObject, 'secret key 123');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)); 
        console.log("from usercontext",decryptedData); // [{id: 1}, {id: 2}]
        usercontext = decryptedData;
        return "Ok";
    }
}

export {userContextConfiguration, usercontext }
