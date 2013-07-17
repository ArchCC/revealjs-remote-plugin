/**
 * Touch-based remote controller for your presentation courtesy 
 * of the folks at http://remotes.io
 */

(function(window){

    /**
     * Detects if we are dealing with a touch enabled device (with some false positives)
     * Borrowed from modernizr: https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touch.js   
     */
    var hasTouch  = (function(){
        return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
    })();

    /**
     * Detects if notes are enable and the current page is opened inside an /iframe
     * this prevents loading Remotes.io several times
     */
    var remotesAndIsNotes = (function(){
      return !(window.RevealNotes && self == top);
    })();

    if(!hasTouch && !remotesAndIsNotes){
        /**head.ready( 'remotes.ne.min.js', function() {
            new Remotes("preview")
                .on("swipe-left", function(e){ Reveal.right(); })
                .on("swipe-right", function(e){ Reveal.left(); })
                .on("swipe-up", function(e){ Reveal.down(); })
                .on("swipe-down", function(e){ Reveal.up(); })
                .on("tap", function(e){ Reveal.next(); })
                .on("zoom-out", function(e){ Reveal.toggleOverview(true); })
                .on("zoom-in", function(e){ Reveal.toggleOverview(false); })
            ;
        } );

        head.js('https://raw.github.com/Remotes/Remotes/master/dist/remotes.ne.min.js');*/

        head.ready( 'socket.io.js', function() {

            var remoteAll = function (params, connectCallback) {
                var self = this

                this.options = params;
                if (!this.options.url) {
                    this.options.url = this.options.host.protocol + '://' + this.options.host.domain + ':' + this.options.host.port;
                }
                //alert('3');
                this.socket = io.connect(this.options.url);

                this.socket.on('connect', function () {

                    self.setSession(self.options.appId, self.options.uniqueSessionId)
                    if (connectCallback) {
                        connectCallback.call(self, arguments);
                    }
                })

                this.handlers = {
                    recive_code: []
                }
                this.on = function (event, callback) {
                    if (!this.handlers[event]) {
                        this.handlers[event] = [];
                    }
                    this.handlers[event].push(callback);
                };
                this.off = function (event) {
                    this.handlers[event] = [];
                }
                this.trig = function (event) {
                    var args = Array.prototype.slice.call(arguments, 1, arguments.length);
                    for (var key in this.handlers[event]) {
                        var func = this.handlers[event][key];
                        func.apply(this, args);
                    }
                }

                this.socket.on('members_list', function (list, session_id) {
                    self.trig('members_list', list, session_id);
                });

                this.socket.on('on', function (member_data, session_id) {
                    self.trig('on', member_data, session_id);
                });

                this.socket.on('off', function (member_data, session_id) {
                    self.trig('off', member_data, session_id);
                });

                this.socket.on('recive_code', function (data, session_id) {
                    self.trig('recive_code', data, session_id);
                })
                /**
                 *
                 * @param code
                 * @param session_id
                 */
                this.sendCode = function (code, session_id) {
                    this.socket.emit('send_code', code, session_id);
                }
                /**
                 *
                 * @param appId
                 * @param uniqueSessionId
                 */
                this.setSession = function (appId, uniqueSessionId) {
                    self.socket.emit('set_session', appId, uniqueSessionId);
                }
                /**
                 *
                 * @param session_id
                 */
                this.addSession = function (session_id, member_data) {
                    this.socket.emit('add_session', session_id, member_data);
                }
                /**
                 *
                 * @param session_id
                 */
                this.removeSession = function (session_id) {
                    this.socket.emit('remove_session', session_id);
                }
            }

            var REMOTE_ALL_CONFIG = {
                appId:'appNan',
                uniqueSessionId:'SecretStringForConnection',
                url:null, //if defined @host@ will be ignored
                host:{
                    protocol:'http',
                    domain: window.location.hostname,
                    port:'8888'
                }
            }

            //REMOTE_ALL_CONFIG.uniqueSessionId = 'SecretSession_' + Math.random();
            //REMOTE_ALL_CONFIG.app = 'myApp';

            var ra = new remoteAll(REMOTE_ALL_CONFIG, function (context, args) {
                // do nothing
            });
            var timer = null;

            ra.on('recive_code', function (data, session_id) {

                switch (data.button_code) {

                    case 'DOWN':
                        Reveal.down();
                        break;

                    case 'RIGHT':
                        Reveal.right();
                        break;

                    case 'UP':
                        Reveal.up();
                        break;

                    case 'LEFT':
                        Reveal.left();
                        break;

                    case 'CARD':
                        document.getElementById('myCard').classList.toggle('hover');
                        break;

                    case 'YQ':
                        document.getElementById('myYQ').classList.toggle('hover');
                        break;

                    case 'WALLET':
                        document.getElementById('myWallet').classList.toggle('hover');
                        break;

                    case 'PHONE':
                        document.getElementById('myPhone').classList.toggle('hover');
                        break;
                }
            })
        } );

        head.js('http://'+window.location.hostname+':8888/socket.io/socket.io.js');
    }
})(window);