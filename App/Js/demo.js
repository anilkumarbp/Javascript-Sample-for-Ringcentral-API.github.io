    
    
    var callrecording;

    function rcManager(appKeyField,appSecretField,usernameField,extensionField,passwordField) {
        var t=this;
        t.appKeyField    = appKeyField;
        t.appSecretField = appSecretField;
        t.usernameField  = usernameField;
        t.extensionField = extensionField;
        t.passwordField  = passwordField;
        t.serverUrl = 'https://platform.devtest.ringcentral.com';
        t.rcsdk     = '';
        t.rch       = '';
        t.authorizeFields = function() {
            t.authorizeFull(
                    $(t.appKeyField).val(),
                    $(t.appSecretField).val(),
                    $(t.usernameField).val(),
                    $(t.extensionField).val(),
                    $(t.passwordField).val()
            );
        }
        t.authorizeFull = function(appKey,appSecret,username,extension,password) {
            t.loadRcsdk(appKey,appSecret);
            t.authorize(username,extension,password);
        }
        t.loadRcsdk = function(appKey,appSecret) {
            t.rcsdk = new RCSDK({
                server: t.serverUrl,
                appKey: appKey,
                appSecret: appSecret
            });
        }
        t.authorize = function(username,extension,password) {
            p = t.rcsdk.getPlatform();
            s = t.rcsdk;
            p.authorize({
                username:  username, // phone number in full format
                extension: extension, // leave blank if direct number is used
                password:  password
            }).then(function(response) {
                
                alert('success: '+response);
            }).catch(function(e) {
                alert('ERR ' + e.message  || 'Server cannot authorize user');
            });
            t.rch = new rcHelper(p,s);
        }
    }

    function rcHelper(platform,rcsdk) {
        var t=this;
        // var callrecording;
        t.platform = platform;
        t.rcsdk = rcsdk;
        t.send_sms = function(from,to,text) {
            t.platform.post('/account/~/extension/~/sms', {
                body: {
                    from: {phoneNumber:from}, // Your sms-enabled phone number
                    to: [
                        {phoneNumber:to} // Second party's phone number
                    ],
                    text: text
                }
            }).then(function(response) {
                alert('Success: ' + response.data.id);
                var txt=JSON.stringify(response.data, null, 2);
                document.getElementById("sms_result").innerHTML=txt;
            }).catch(function(e) {
                alert('Error: ' + e.message);
            });
        }

        t.ring_out = function(from,to) {
            this.platform.post('/account/~/extension/~/ringout', {
                body: {
                    from: {phoneNumber:from}, // Your sms-enabled phone number
                    to: {phoneNumber:to}, // Second party's phone number
                    playPrompt: true
                }
            }).then(function(response) {
                alert('Success: ' + response.data.id);
                var txt=JSON.stringify(response.data, null, 2);
                document.getElementById("ringout_result").innerHTML=txt;
            }).catch(function(e) {
                alert('Error: ' + e.message);
            });
        }

        t.call_log = function() {
            t.platform.get('/account/~/extension/~/call-log').then(function(response) {
                alert('Success: ' + response.data.uri.toString());
                var txt=JSON.stringify(response.data, null, 2);
                // alert('txt json')
                callrecording = txt;
                // alert('The JSON array is' + callrecording.toString());
                console.log('The Value of callrecording string is'+callrecording);
                document.getElementById("call-logs-text").innerHTML=txt;
            }).catch(function(e) {
                alert('Error: ' + e.message);
            });
        }

        t.presence = function() {
            t.platform.get('/account/~/extension/~/presence').then(function(response) {
                alert('Success: ' + response.data.uri.toString());
                var txt=JSON.stringify(response.data, null, 2);
                document.getElementById("presence").innerHTML=txt;
            }).catch(function(e) {
                alert('Error: ' + e.message);
            });
        }

        t.get_info = function() {
            t.platform.get('/account/~/').then(function(response) {
                alert('Success: ' + response.data.uri.toString());
                var txt=JSON.stringify(response.data, null, 2);

                document.getElementById("result").innerHTML=txt;
            }).catch(function(e) {
                alert('Error: ' + e.message);
            });
        }

        t.messagestore= function() {
            t.platform.get('/account/~/extension/~/message-store').then(function(response) {
                alert('Success: ' + response.data.uri.toString());
                var txt=JSON.stringify(response.data, null, 2);
                document.getElementById("message-store").innerHTML=txt;
            }).catch(function(e) {
                alert('Error: ' + e.message);
            });
        }

        t.calllogrecording = function() {
         

                var json = JSON.parse(callrecording);
                var len = json.records.length;

                 for(i=0;i<len;i++) {


                      if(json.records[i].hasOwnProperty('recording')){
                                    var uri = json.records[i].recording.contentUri;
                                    // alert('The recording URI is:'+ uri);
                                    console.log('The Value of URI is'+ uri);
                                    var url = uri.replace (/^[a-z]{5}\:\/{2}[a-z]{1,}\.[a-z]{1,}\.[a-z]{1,}\.[a-z]{1,}\:[0-9]{1,4}\/{1}[a-z]{1,}\/{1}[a-z]{1,}.\.0(.*)/, '$1');
                                    console.log('Replaced URI'+ url);
                                    

                                    t.platform.get(url).then(function(response){
                                        // response.setHeader('Content-Type':'audio/x-wav');
                                        alert('Success: ' + response.data);
                                        // var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
                                        // var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

                                        window.open("data:"+"audio/mpeg"+","+encodeURIComponent(response.data), '_blank', '');

                                        // var donwloadLink = document.getElementById("download_call_recordings");
                                        // donwloadLink.href = "data:audio/mpeg;charset=utf-8;base64,"+window.btoa(unescape(encodeURIComponent(response.data)));
                                        // donwloadLink.download = 'sample.mp3';
                                        
                                        // var event = document.createEvent

                                        // var donwloadLink = btoa()
                                        // console.log(response.data);
                                        // console.log(donwloadLink.href);
                                        // console.log()
                                        // alert('Response Header' + response.);
                                    }).catch(function(e){
                                        alert('Error' + e.message);
                                    });

                             
                        }
                }
        }
        t.startSubscription = function () {
            console.log("inside subscription");
            t.subscription = t.rcsdk.getSubscription();
            console.log(t.rcsdk);
            console.log(t.subscription);
            t.subscription
            .on(t.subscription.events.notification, function(msg) {
                conosle.log("inside on function");
                var callerId = msg.body.activeCalls[0].from;
                console.log(msg.body.activeCalls[0].from); // activeCalls is array
                console.log(msg.body.activeCalls[0].to);
                var call0 = msg.body.activeCalls[0];
                var json = JSON.stringify(call0);
                document.getElementById("subscription").innerHTML=txt;
                console.log(json);
                rcCallWin.processCall(call0);
            })
            .register({
                events: [
                    '/account/~/extension/~/presence?detailedTelephonyState=true'
                ],
            })
            .then();
        }
    }



          


rcm = new rcManager('#appkey','#appSecret','#userid','#extension','#password');

