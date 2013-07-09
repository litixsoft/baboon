module.exports = {
    session: {
        controllers: {
            session: require('./session/controllers/session.js')
        }
    },
    blog: {
        controllers: {
            blog: require('./blog/controllers/blog.js')
        }
    },
    enterprise: {
        controllers: {
            enterprise: require('./enterprise/controllers/enterprise.js')
        }
    }
};