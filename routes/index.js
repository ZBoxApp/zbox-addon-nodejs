var express = require('express');
var api = require('zbox-addon').api;
var router = express.Router();
var zbox;

module.exports = function(addon) {
    zbox = api(addon, { client_id: "5srs35euj3nqtx5tedxyhf16ra", client_secret: "fjmr785f37fy5yudcy9msm13no", url: 'http://localhost:8065/' });

    /* GET home page. */
    router.get('/',
        function(req, res) {
            res.render('index', {title: 'Hello! addon for ZBox Now!'});
        });

    router.get('/config',
        addon.context(),
        function(req, res) {
            return res.render('config', req.context);
        });

    router.get('/channels/:team', function(req, res) {
        zbox.getChannels(req.params.team, function(err, channels) {
            if (err) {
                return res.status(err.status).json(err);
            }

            return res.json(channels);
        });
    });

    router.get('/users/:team', function(req, res) {
        zbox.getUsers(req.params.team, function(err, users) {
            if (err) {
                return res.status(err.status).json(err);
            }

            return res.json(users);
        });
    });

    router.post('/webhook',
        addon.context(),
        function(req, res) {
            /*
            req.hook contains the following:
            token -> use this to validate the webhook
            team_id -> the id of the team from where the webhook was initiated
            channel_id -> the id of the channel from where the webhook was initiated
            channel_name -> the name of the channel from where the webhook was initiated
            datetime -> Date and time when the webhook was initiated
            user_id -> the id of the user who initiated the webhook
            username -> the username of the user who initiated the webhook
            message -> the text written by the user
            */
            var hook = req.hook;
            res.json(zbox.prepare('Hi @' + hook.username + '! I completlety agree with you this time.'));
        });

    router.post('/command1', function(req, res) {
       console.log(req.body);
        var title = '### Hello @' + req.body.user_name + '!';
        var obj = {
            response_type: 'ephemeral',
            text: title + '\n--- \
            \n#### Weather in Toronto, Ontario for the Week of February 16th, 2016 \
            \n\
            \n| Day                 | Description                      | High   | Low    | \
            \n|:--------------------|:---------------------------------|:-------|:-------| \
            \n| Monday, Feb. 15     | Cloudy with a chance of flurries | 3 °C   | -12 °C | \
            \n| Tuesday, Feb. 16    | Sunny                            | 4 °C   | -8 °C  | \
            \n| Wednesday, Feb. 17  | Partly cloudly                   | 4 °C   | -14 °C | \
            \n| Thursday, Feb. 18   | Cloudy with a chance of rain     | 2 °C   | -13 °C | \
            \n| Friday, Feb. 19     | Overcast                         | 5 °C   | -7 °C  | \
            \n| Saturday, Feb. 20   | Sunny with cloudy patches        | 7 °C   | -4 °C  | \
            \n| Sunday, Feb. 21     | Partly cloudy                    | 6 °C   | -9 °C  | \
            \n---'
        };
        return res.json(obj);
    });

    addon.on('published',
        function(clientId, clientSecret) {
            /*
            do something with the clientId and clientSecret save them in a safe place
            IMPORTANT: The Client Secret cannot be recovered
            */
            zbox = api(addon, {
                client_id: clientId,
                client_secret: clientSecret
            });
        });

    addon.on('installed',
        function(team, incoming, outgoing) {
            /*
            team contains id and name for the team that installed the addon
            if you configured incoming webhooks incoming contains the token to use
            for each outgoing webhook that you defined you'll have the key and the token
            */

            outgoing.forEach(function(o) {
                addon.logger.info('Outgoing webhook key: %s, token: %s', o.key, o.token);
            });

            // use the API to get the channes to which u can send a message
            var channelName = 'town-square';

            var opts = {
                token: incoming.token,
                message: '**This addon has been installed!!** :wink:',
                team_name: team.name,
                channel_name: channelName
            };

            zbox.sendMessage(opts,
                function(err) {
                    if (err) {
                        addon.logger.error(err);
                    }
                });
        });

    addon.on('uninstalled', function(teamId) {
        /*
        Do what you need to do to completely uninstall the team_id on your end
        */

        addon.logger.info('Uninstalled by team id: %s', teamId);
    });

    return router;
};
