/*

Dear Developer,

Welcome to Slash Webtasks - slack slash commands powered by Auth0 Webtasks (https://webtask.io).

Implement the logic of your slash command in the function below.
Then save and run with '/wt {name} [{param} {param} ...]' from slack.

If your code needs secrets (e.g. Twilio keys), add them using the key icon on the right -------->
You can then get them from code via ctx.secrets, e.g. ctx.secrets.TWILIO_KEY.
Never add secrets to your code directly.

The payload you receive from slack is available in ctx.body and may look like this:

{
 "team_id": "T025590N6",
 "team_domain": "auth0",
 "channel_id": "D1KFTMMTJ",
 "channel_name": "directmessage",
 "user_id": "U02FMKT1L",
 "user_name": "tomek",
 "command": "/wt run hello",
 "text": "foo bar baz",
 "response_url": "https://hooks.slack.com/commands/T025540N6/86862216608/4DNA0LVn6QG7xqfBhGSTIqoc"
}

Note that ctx.body.text contains the parameters to the Slash Webtask you typed in slack, 
e.g. "foo bar baz" if you typed "/wt hello foo bar baz" in slack.
Details of the payload are documented at https://api.slack.com/slash-commands#triggering_a_command.

The object you respond with will be passed back to Slack as JSON. 
Details of the response payload are documented at https://api.slack.com/slash-commands#responding_to_a_command.

Please file issues at https://github.com/auth0/slash-webtask/issues.

Enjoy!

The Auth0 Webtask Team
webtask@auth0.com
https://webtask.slack.com (join via http://chat.webtask.io)

*/

module.exports = function (ctx, cb) {
  
  var params = ctx.body.text.split(' ');
  var username = ctx.body.user_name;
  
  if(!params || params.length < 2){
    cb(null, {
      text: 'Please provide full detail. /wt paid {amount} {reason}' 
    })  
    return;
  }
  
  ctx.storage.get(function (error, data) {
    if (error) return cb(error);
    
    data = data || { };
    
    var date = new Date();
    var year = date.getYear() + 1900;
    var month = date.getMonth() + 1;
    
    var key = month + "_" + year;
    if(!data[key]){
      data[key] = [];
    }
    
    var amount = params[0];
    var reason = params.slice(1, params.length).join(' ').trim();
    if(reason.startsWith('for')){
      reason = reason.slice(3, reason.length).trim();
    }
    
    var totalPaid = 0;
    data[key].map(p => {
      if(p.username == username){
        totalPaid += parseInt(p.amount)
      }
    });
    
    var messageTemplate = `Thanks ${username} for paying ${amount} for ${reason}, Your total payment for this month is ${totalPaid}`;
  
    data[key].push({
      username: username,
      date: date.getTime(),
      amount: parseInt(amount),
      reason: reason
    });
    
    ctx.storage.set(data, function (error) {
      if (error) return cb(error);
      
      cb(null, {
        // response_type: 'in_channel', // uncomment to have the response visible to everyone on the channel
        text: messageTemplate
      });
    });
  });
};
