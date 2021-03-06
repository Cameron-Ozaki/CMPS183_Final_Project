// This is the js for the default/index.html view.


var app = function () {

    var self = {};

    Vue.config.silent = false; // show all warnings
    Vue.config.devtools = true;


    self.user_pref_edit_toggle = function (input) {
        self.vue.is_edit_user_name = false;
        if (input === "name") {
            self.vue.is_edit_user_name = true;
        }
    }

    self.get_user_pref = function () {
        $.get(get_user_pref_url, function (data) {
            self.vue.user_pref = data;
        })
    }

    self.update_user_pref = function () {
        $.post(update_user_pref_url, {
            user_first_name: self.vue.user_pref.first_name,
            user_last_name: self.vue.user_pref.last_name,
        })
        self.vue.is_edit_user_name = false;
    }

    self.cancel_user_pref = function () {
        $.get(get_user_pref_url, function (data) {
            self.vue.user_pref = data;
        })
        self.vue.is_edit_user_name = false;
    }

    self.open_uploader = function () {
        $('#avatar_uploader').modal({closable: false}).modal('show');
        self.vue.is_uploading = true;
    };

    self.close_uploader = function () {
        $('#avatar_uploader').modal('hide');
        self.vue.is_uploading = false;
        $("#avatar_file_input").val(""); // This clears the file choice once uploaded.

    };

    self.upload_file = function (event) {
        // Reads the file.
        var input = $('#avatar_file_input')[0];
        var file = input.files[0];

        // TODO read local copy instead of waiting 1 second
        if (file) {
            // First, gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('http://1-dot-grubmeet-205717.appspot.com/grubmeet/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_complete(get_url));
                    req.addEventListener("error", self.upload_error);

                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };

    self.upload_error = function () {
        console.log("error during upload")
    }

    self.upload_complete = function (get_url) {
        // Hides the uploader div.
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        self.vue.file_selected = false;
        self.vue.upload_file_name = null;
        setTimeout(function () {
            self.update_avatar(get_url);
        }, 1500);
    };

    self.update_avatar = function (get_url) {
        $.post(update_avatar_url, // defined at index.html header.
            {
                image_url: get_url,
            },
            function (data) {
                self.vue.user_avatar = data.image;
            });
    };

    self.get_user_avatar = function () {
        // intital list
        console.log("getting avatar");
        $.getJSON(get_user_avatar_url,
            function (data) {
                self.vue.user_avatar = data.image_url;
            })
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#user-pref-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            // global variables
            user_pref: {},
            user_avatar: null,
            is_edit_user_name: false,
            user_is_editing: null,
            is_uploading: false,
            file_selected: null,
            upload_file_name: null
        },
        methods: {
            update_user_pref: self.update_user_pref,
            cancel_user_pref: self.cancel_user_pref,
            user_pref_edit_toggle: self.user_pref_edit_toggle,
            close_uploader: self.close_uploader,
            open_uploader: self.open_uploader,
            upload_file: self.upload_file,
        }
    });

    self.get_user_pref();
    // self.get_user_avatar();
    $('#user-pref-div').removeClass('hidden');
    $('#avatar_file_input').change(function () {
        self.vue.file_selected = true;
        self.vue.upload_file_name = this.value.replace(/.*[\/\\]/, '');
    });
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () {
    APP = app();
});


