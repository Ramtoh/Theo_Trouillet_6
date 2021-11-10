const passwordValidator = require('password-validator');

const schema = new passwordValidator();

schema
.is().min(5)    // longueur minimum de 5 caracteres
.is().max(25)  // longueur maximum de 25 caracteres
.has().uppercase()  // contient des majuscules
.has().lowercase()  // contient des minuscules
.has().digits(2)    // au moins 2 chiffres
.has().not().spaces() // aucun espace admis

module.exports = (req, res, next) => { 
    if(schema.validate(req.body.password)) {
        next();
    } else {
        return res
        .status(400)
        .json({ error : `Le mot de passe est trop faible ${schema.validate('req.body.password', { list: true })}`})
    }
}