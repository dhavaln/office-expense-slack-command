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
