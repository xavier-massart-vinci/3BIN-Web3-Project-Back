const jwt = require('jsonwebtoken');

function verifyAuth(req, res, next){
    console.log(req.header('Authorization'));
    const token = req.header('Authorization');
    if(!token){
        return res.sendStatus(401);
    }
    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    }catch{
        res.sendStatus(401);
    }
}


io.use((socket, next) => { 
    const token = socket.handshake.auth.token;
     if (!token) { 
        return next(new Error('Authentication error')); 
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) { 
            return next(new Error('Authentication error')); 
        } 
      socket.user = user; 
      next(); 
    }); 
  });


module.exports = verifyAuth;