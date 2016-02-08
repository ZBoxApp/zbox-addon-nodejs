var express = require('express');
var api = require('zbox-addon').api;
var router = express.Router();
var zbox;

module.exports = function(addon) {
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

            addon.sendMessage(opts,
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
