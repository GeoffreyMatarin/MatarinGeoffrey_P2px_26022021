const passwordSchema = require('../models/passwordValid');


// vérifie que le mot de passe valide le schema décrit
module.exports = (req, res, next) => {
    if (!passwordSchema.validate(req.body.password)) {
        res.status(400).json({ error: "Format de mot de passe incorrect" })
    }
    else {
        //on passe au middleware suivant
        next();
    }
};
