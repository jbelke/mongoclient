/**
 * Created by RSercan on 26.12.2015.
 */
var jsonEditor;
var jsonEditorOptions = {
    mode: "tree",
    search: true
};

getEditor = function () {
    if ($('.jsoneditor').length == 0) {
        jsonEditor = new JSONEditor(document.getElementById("jsoneditor"), jsonEditorOptions);
    }
    return jsonEditor;
}

Template.browseDB.helpers({
    'collectionNames': function () {
        return Session.get(strSessionCollectionNames);
    }
});

Template.browseDB.events({
    'click #btnSwitchView': function (e) {
        var jsonView = $('#divJsonEditor');
        var aceView = $('#divAceEditor');

        if (jsonView.css('display') == 'none') {
            aceView.hide();
            jsonView.show('slow');
        } else {
            jsonView.hide();
            aceView.show('slow');
        }

    },

    'keypress #inputQuery': function (e) {
        // catch enter
        if (e.keyCode == 13) {
            executeQuery();
            return false;
        }
    },

    'click #btnExecuteQuery': function (e) {
        executeQuery();
    }
});

executeQuery = function () {
    var connection = Connections.findOne({_id: Session.get(strSessionConnection)});
    var selectedCollection = Session.get(strSessionSelectedCollection);
    var query = 'db.' + selectedCollection + '.' + $('#inputQuery').val();

    Meteor.call('executeQuery', connection, query, function (err, result) {
        if (result.error) {
            toastr.error("Couldn't execute query: " + result.error.message);
            return;
        }

        getEditor().set(result.result);

        AceEditor.instance("aceeditor", {
            mode: "javascript",
            theme: 'dawn'
        }, function (editor) {
            editor.$blockScrolling = Infinity;
            editor.setOptions({
                fontSize: "12pt"
            });
            editor.setValue(JSON.stringify(result.result, null, '\t'));
        });

    });
}