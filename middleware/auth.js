module.exports = {
    ensureAuth: function(req, res, next) {
        if(req.isAuthenticated()){
            return next()
        }else{
            return res.redirect('/')
        }
    },
    ensureGuest: function(req, res, next) {
        if(req.isAuthenticated()){
            return res.redirect('/dashboard')
        }else{
            return next()
        }
    }
}