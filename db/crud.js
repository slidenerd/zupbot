'use strict';

// if our user.js file is at user.js
let User = require('./user');

let crud = {
  upsert: function (query, document, callback) {
    User.findOneAndUpdate(query, document, { upsert: true, new: true }, callback);
  },

  remove: function (query, callback) {
    User.remove(query, callback);
  }
}

// crud.upsert({_id: 'b446aa34'}, {email: 'ankushdeshpande16@gmail.com'}, (error, document)=>{
//   if(error){
//     console.log(error);
//   }
//   else{
//     console.log(document);
//   }
// })

// crud.remove({ _id: '1078904948813864' }, () => {
//   console.log('done')
// })

module.exports = crud;