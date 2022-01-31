import { EMAILUtility, MyObj } from './js/utility.js';
import { Configuration, EMAILConfiguration } from './js/configuration.js';
import { HTTP_SUCCESS_CODE } from './js/constant.js';
import { usercontext } from './js/usercontext.js';
import uuidv4 from "./bundles/@bundled-es-modules/uuid/v4.js";
import { ExternalPreviewPopup } from "./external_preview_popup.js"
import translation from './js/translation.js';
var isSaved = false;

var EMAILInitialization = {

    /*
    * This method will initialize stripo plugin template.
    * It call the callback method - initplugin once the html and css template is initialized.
    * multi_line - saving template html in multi_line field(content type property)
    */
    loadTemplate: function (callback) {
        this.convertTextAsPerLocale();
        getTemplateFromEntry().then(response => {
            let content = response.entry.full_html_content;
            if (content == "" || content === undefined) {
                const url = './components/blankstripostructure.html';
                request('GET', url, null, function (html) {
                    request('GET', Configuration.Stripo.DefaultTemplate.css, null, function (css) {
                        callback({ html: html, css: css });
                    });
                });
            }
            else {
                console.log('else')
                request('GET', Configuration.Stripo.DefaultTemplate.css, null, function (css) {
                    callback({ html: content, css: css });
                });
            }
        });
    },

    convertTextAsPerLocale: function () {
        var locale = usercontext.locale.split('-')[0];
        if (locale === 'es') {
            document.getElementById("codeEditor").innerText = translation.es.codeeditor;
            document.getElementById("previewButton").innerText = translation.es.preview;
            document.getElementById("saveButton").innerText = translation.es.save;
        }
        else {
            document.getElementById("codeEditor").innerText = translation.en.codeeditor;
            document.getElementById("previewButton").innerText = translation.en.preview;
            document.getElementById("saveButton").innerText = translation.en.save;
        }
    },

    /*
    * This method will initialize stripo plugin template.
    * The Auth plugin id and secret key can be read from config file but in future will shift that in api side.
    */
    initPlugin: function (template) {
        const apiRequestData = {
            emailId: uuidv4()
        };
        const script = document.createElement('script');
        script.id = 'stripoScript';
        script.type = 'text/javascript';
        script.src = Configuration.Stripo.StripoSource;
        script.onload = async function () {
            window.Stripo.init({
                mergeTags: MyObj,
                extensions: [
                    {
                        globalName: "CustomBlockExtension",
                        url: "https://tavisca-vvijayakumar.github.io/important_information_mainjs/importantInformationBlock.extension.js"
                    }
                ],
                "blockConfiguration": {
                    "enabled": `${(usercontext.contentTypeId !== usercontext.customblock.contenttypeuuid ? true : false)}`,
                    "groups": await loadContentBlocksGroup()
                },
                settingsId: 'stripoSettingsContainer',
                previewId: 'stripoPreviewContainer',
                codeEditorButtonId: 'codeEditor',
                locale: usercontext.locale.split('-')[0],
                html: template.html,
                css: template.css,
                ignoreClickOutsideSelectors: '#externalFileLibrary',
                apiRequestData: apiRequestData,
                getAuthToken: function (callback) {
                    request('POST', Configuration.Stripo.StipoAuthUrl,
                        JSON.stringify({
                            pluginId: usercontext.pluginId,
                            secretKey: usercontext.secretKey
                        }),
                        function (data) {
                            callback(JSON.parse(data).token);
                        });
                }
            });
        };
        document.body.appendChild(script);
    }
};

/*
* This method will return html entry response to load plugin.
*/
async function getTemplateFromEntry() {
    var queryParameter = {
        locale: usercontext.locale
    }
    var url = `${Configuration.ContentStack.baseUrl}` + 'content_types/' + `${usercontext.contentTypeId}`
                     + '/entries/' + `${usercontext.entryId}?` + addQueryParametersToContentStackUrl(queryParameter);
    var headers = EMAILUtility.getContentStackRequestHeader();
    return await EMAILUtility.createFetchRequest(url, headers, "GET");
}

/*
* This method will save modified template to content stack
*/
async function saveTemplateToContentStack(htmltext) {

    var queryParameter = {
        form_uid: usercontext.customblock.contenttypeuuid,
        entry_uid: usercontext.entryId,
        locale: usercontext.locale
    }
    var response = retrieveContentBlockContentFromHTML(htmltext);

    var data = {
        "entry": {
            "custom": "",
            "multi_line": response,
            "full_html_content": htmltext,
            "tags": []
        }
    };

    var url = `${Configuration.ContentStack.baseUrl}` + 'content_types/' + `${usercontext.contentTypeId}` + '/entries/' +
                     `${usercontext.entryId}?` + addQueryParametersToContentStackUrl(queryParameter);
    var headers = EMAILUtility.getContentStackRequestHeader();

    var successCode = await EMAILUtility.createFetchRequest(url, headers, "PUT", data);

    if (successCode !== HTTP_SUCCESS_CODE) {
        //EMAILUtility.showSuccessErrorMessage("Error!! Changes done to the template have not been saved. Please retry.", "red");
        throw new Error("Some exception occured");
    }

    //EMAILUtility.showSuccessErrorMessage("Template has been saved successfully.", "lightgreen");

    alert("Template has been saved successfully");
}

var retrieveContentBlockContentFromHTML = function (html) {

    if (usercontext.contentTypeId === usercontext.customblock.contenttypeuuid) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var contentBlockContent = doc.querySelector('td.esd-stripe');
        if (contentBlockContent === undefined) {
            var contentBlockElement = doc.querySelector('td.esd-structure');
            return contentBlockElement.innerHTML;
        }

        return contentBlockContent.innerHTML;
    }

    return html;


}

var request = function (method, url, data, callback) {
    EMAILUtility.createXMLHttpRequest(method, url, data, callback);
};

var loadContentBlocksGroup = async function () {
    var queryParameter = {
        environment: usercontext.environment,
        locale: usercontext.locale,
        includefallback: usercontext.includefallback
    }

    var url = `${Configuration.ContentStack.baseUrl}` + 'content_types/' +
        `${usercontext.customblock.contenttypeuuid}` + '/entries?' + addQueryParametersToContentStackUrl(queryParameter);
    var headers = EMAILUtility.getContentStackRequestHeader();

    var response = await EMAILUtility.createFetchRequest(url, headers, "GET");

    if (response != undefined) {
        var contentBlockGroupList = [];

        response.entries.forEach(element => {
            var group = {
                "id": element.uid,
                "name": element.name === undefined ? element.title : element.name,
                "placeholder": element.placeholdertext,
                "contenttype": usercontext.customblock.contenttypeuuid,
                "locale": element.locale
            }

            contentBlockGroupList.push(group);
        });

        return contentBlockGroupList;
    }

    return [];
}

var addQueryParametersToContentStackUrl = function (queryParameter) {
    if (queryParameter === undefined) {
        return;
    }

    let query = ""
    for (let parameter in queryParameter)
        query += encodeURIComponent(parameter) + '='
            + encodeURIComponent(queryParameter[parameter]) + '&'
    return query.slice(0, -1)
}

document.querySelector("#saveButton").addEventListener('click', function (data) {
    window.StripoApi.getTemplate(function (html, css) {
        saveTemplateToContentStack(html)
        isSaved = true;
    })
});
async function creplace(html) {
    var EntryUID = "";
    var ContenttypeUID = "";
    var StringHTML = html;
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");
    var customBlockNodeList = doc.querySelectorAll('custom-block');
    if (customBlockNodeList.length == 0) {
        ExternalPreviewPopup.openPreviewPopup(StringHTML);
    }
    for (var i = 0; i < customBlockNodeList.length; i++) {
        var element = customBlockNodeList[i];
        var outerhtml = element.outerHTML;
        EntryUID = element.getAttribute('selectedblocktypeuid');
        ContenttypeUID = element.getAttribute('selectedcontenttype');
        var headers = EMAILUtility.getContentStackRequestHeader();
        var url = `${Configuration.ContentStack.baseUrl}` + 'content_types/' + ContenttypeUID + '/entries/' + EntryUID;
        var successCode = await EMAILUtility.createFetchRequest(url, headers, "GET")
        StringHTML = StringHTML.replace(outerhtml, successCode.entry.multi_line);
    }
    ExternalPreviewPopup.openPreviewPopup(StringHTML);
    // return StringHTML;
}
document.querySelector('#previewButton').addEventListener('click', function () {
    window.StripoApi.compileEmail(function (error, html) {
        var doc = creplace(html);

    });
});

window.addEventListener("beforeunload", function (e) {
    if (!isSaved) {
        var dialogText = 'There are some unsaved changes , Do you want to leave the site';
        e.returnValue = dialogText;
        return dialogText;
    }
});
window.addEventListener("keydown", event => {
    if (event.isComposing || event.keyCode === 27) {
        externalPreviewPopup.style.visibility = 'hidden';
    }
    // do something
});
export { EMAILInitialization }
