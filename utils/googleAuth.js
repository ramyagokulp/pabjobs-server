const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_AUTH_CLIENT_ID)

const googleAuth = async (token) => {
    // return Promise(async (resolve, reject) => {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_AUTH_CLIENT_ID
        })
        const payload = ticket.getPayload();
        if (!payload) {
            return false;
        }
    
        const { sub, email, name } = payload;
        const userId = sub;
        return {userId, email, name}
    // })
    
}

module.exports = googleAuth;